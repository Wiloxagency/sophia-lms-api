import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../Log/logsFunction";

describe("Log", () => {
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

  test("getLogs - 200 - Get Logs", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Log",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("log");
    const insertedDocuments = [
      {
        name: "Administrator update",
        code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
        permissions: ["ADMINISTRATOR.MAIN"],
      },
      {
        name: "Instructor up",
        code: "123",
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
  });

  test("getLogs - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Log",
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
      throw new Error("Error");
    }
  });
});
