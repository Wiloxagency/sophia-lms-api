import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../Demo/demoFunction";

describe("Demo", () => {
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

  test("getDemos - 200 - Get Demos", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Demo",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("course");
    const insertCourse = {
      code: "7b8cb439-c434-4702-914a-4d9ade82cef0",
      organizationCode: "000012b5-2ff3-4634-9347-3bcd4c1e0000",
      author_code: "66b13992-584a-47de-99df-7fb23bc34654",
      approvalStatus: "Pending approval",
      dateCreated: "2023-02-25",
      language: "es",
      lessonTheme: "1",
      details: {
        title: "Ensalada César",
        summary: "Cómo hacer la mejor ensalada César",
        categories: ["Salud"],
        cover:
          "https://tse4.mm.bing.net/th?id=OIP.ky9j_sVNs1Okt-Or7mfSrAHaFq&pid=Api",
      },
      sections: [],
    };

    await collection.insertOne(insertCourse);

    const collectionUser = db.collection("user");
    const insertUser = {
      name: "Addiel Machado",
      email: "amachado@edutecno.com",
      password: "$2a$10$1Ee8onnJHzP6G53Ku3UdLOjpVlZ5SWm/QEdljOE1WinnRyPYA1PjS",
      status: "Activo",
      code: "66b13992-584a-47de-99df-7fb23bc34654",
      role: "Estudiante",
      last_access: "",
      phone: "",
      company: "Nova Empresa Kelvin",
      organizationCode: "c3fe12b5-2ff3-4634-9347-3bcd4c1e5601",
      position: "TI",
      dataCreated: {
        $date: "2023-04-11T14:26:34.594Z",
      },
    };

    await collectionUser.insertOne(insertUser);

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(200);
    expect(resultado.body).toEqual([
      {
        dateCreated: "2023-02-25",
        company: "Nova Empresa Kelvin",
        curso: "Ensalada César",
        criado_por: "Addiel Machado",
        email: "amachado@edutecno.com",
      },
    ]);
  });

  test("getDemos - 500 - Error - No courses found", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Demo",
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
      throw new Error("No courses found");
    }
  });
});
