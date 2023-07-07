import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, MongoClientOptions } from "mongodb";
import { Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../Course/courseFunction";

describe("Course", () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const db = client.db();
    const collections = await db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  test("createCourse - 201 - Create Course", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Course",
      body: {
        course: {
          code: "111111a1-0307-4dc5-814a-9189c41d83e4",
          organizationCode: "11180a1-3307-4dc5-814a-9189c41d8904",
          author_code: "12180a1-0307-4dc5-814a-9189c41306578",
          approvalStatus: "",
          buildingStatus: "",
          language: "es",
          lessonTheme: "1",
          details: {
            title: "Gobiernos",
            summary: "Cdel siglo XXI",
            categories: [],
            cover:
              "https://tse3.mm.bing.net/th?id=OIP.s13627vz09yx8-PiF2viuAHaEM&pid=Api",
          },
          sections: [],
        },
      },
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(201);
    expect(resultado.body.acknowledged).toBe(true);
    expect(resultado.body.insertedId).toBeDefined();
  });

  test("createCourse - 500 - Catch Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Course",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    try {
      await httpTrigger(
        mockResponse as Context,
        mockRequest as HttpRequest,
        client
      );
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
      throw new Error("Error creating course");
    }
  });

  test("getRoles - 200 - Get Courses", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Course",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("course");
    const insertedDocuments = [
      {
        code: "4add0b79-80b2-40be-8c02-6fbe7e76a573",
        organizationCode: "c3fe12b5-2ff3-4634-9347-3bcd4c1e5601",
        approvalStatus: "Pending approval",
        author_code: "9368538a-9e10-4de2-aff0-d37caf272d16",
        details: {
          title: "La revolución industrial",
          summary: "La revolución industrial",
          categories: [],
          cover:
            "https://tse1.mm.bing.net/th?id=OIP.ThMA2mu-xAFvc0FBAscWxwHaFA&pid=Api",
        },
        sections: [],
        dateCreated: "2023-06-29",
        language: "es-MX",
        lessonTheme: "",
        createdBy: "Usuario pruebas",
      },

      {
        code: "4rfd0b79-80b2-40be-8c02-6fbe7e76a573",
        organizationCode: "c1fe12b5-2ff3-4634-9347-3bcd4c1e5601",
        approvalStatus: "Pending approval",
        author_code: "9368238a-9e10-4de2-aff0-d37caf272d16",
        details: {
          title: "La revolución industrial",
          summary: "La revolución industrial",
          categories: [],
          cover:
            "https://tse1.mm.bing.net/th?id=OIP.ThMA2mu-xAFvc0FBAscWxwHaFA&pid=Api",
        },
        sections: [],
        dateCreated: "2023-06-29",
        language: "es-MX",
        lessonTheme: "",
        createdBy: "Usuario",
      },
    ];

    await collection.insertMany(insertedDocuments);

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(200);
  });
});
