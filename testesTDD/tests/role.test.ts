import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, MongoClientOptions } from "mongodb";
import { Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../Role/roleFunction";

describe("Role", () => {
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

  test("201 - Create role", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Role",
      body: {
        code: "333333bd-b735-453d-b1cb-cf4fc6a6ee32",
        name: "Instructor",
        permissions: [],
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

  test("500 - Error creating role", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Role",
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(500);
  });

  test("200 - Get roles", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Role",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("role");
    const insertedDocuments = [
      {
        name: "Administrator",
        code: "7c19ca4a-6fa0-4f05-8cca-49331f681d1b",
        permissions: ["ADMINISTRATOR.MAIN"],
      },
      {
        name: "Content Manager",
        code: "a8473bfd-76df-42d2-a8d6-ade33ee935b0",
        permissions: ["EDITOR.MAIN"],
      },
      {
        name: "Student",
        code: "7f50d2e4-10b4-4145-91d7-cc31bf3cf40c",
        permissions: ["STUDENT.MAIN"],
      },
      {
        name: "Estudiante",
        code: "30fbb614-d08f-494b-9c4b-52701a3c6906",
        permissions: ["STUDENT.MAIN"],
      },
      {
        name: "Superadmin",
        code: "5a49606b-caac-4b4b-96e0-9c5d0ae6a93c",
        permissions: ["ORGANIZATION.CREATION"],
      },
      {
        code: "333333bd-b735-453d-b1cb-cf4fc6a2pp32",
        name: "Instructor",
        permissions: [],
      },
    ];
    await collection.insertMany(insertedDocuments);

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(200);
    expect(resultado.body).toMatchObject(insertedDocuments);
  });

  test("204 - Unknow Documents", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Role",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("role");

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(204);
  });
});
