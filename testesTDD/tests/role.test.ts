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

  test("createRole - 201 - Create Role", async () => {
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

  test("createRole - 500 - Catch Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Role",
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
      throw new Error("Error creating role");
    }
  });

  test("getRoles - 200 - Get Roles", async () => {
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

  test("getRoles - 204 - Unknow Documents", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Role",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    db.collection("role");

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(204);
    expect(resultado.body).toEqual(undefined);
  });

  test("getRoles - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Role",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    try {
      const resultado = await httpTrigger(
        mockResponse as Context,
        mockRequest as HttpRequest,
        client
      );
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.status).toBe(500);
      throw new Error("Can't get roles");
    }
  });

  test("getRole - 200 - Get Role", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Role",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("role");
    const insertedDocuments = {
      name: "Administrator",
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
      permissions: ["ADMINISTRATOR.MAIN"],
    };

    await collection.insertOne(insertedDocuments);

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(200);
    expect(resultado.body).toMatchObject(insertedDocuments);
  });

  test("getRole - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Role",
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

  test("deleteRole - 200 - Delete Role", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "DELETE",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Role",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("role");
    const insertedDocuments = {
      name: "Administrator",
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
      permissions: ["ADMINISTRATOR.MAIN"],
    };

    await collection.insertOne(insertedDocuments);

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(200);
    expect(resultado.body.deletedCount).toBe(1);
    expect(resultado.body.acknowledged).toEqual(true);
  });

  test("deleteRole - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "DELETE",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Role",
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

  test("updateRole - 201 - Updated Role", async () => {
    const body = {
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
      name: "Instructor Update",
      permissions: ["ADMINISTRATOR.MAIN"],
    };

    const db = client.db();
    const collection = db.collection("role");
    const insertedDocuments = {
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
      name: "Instructor",
      permissions: ["ADMINISTRATOR.MAIN"],
    };

    await collection.insertOne(insertedDocuments);

    const mockRequest: Partial<HttpRequest> = {
      method: "PUT",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Role",
      body: body,
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(201);
    expect(resultado.body).toMatchObject({
      lastErrorObject: { n: 1, updatedExisting: true },
      value: {
        code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
        name: "Instructor",
        permissions: ["ADMINISTRATOR.MAIN"],
      },
      ok: 1,
    });
  });

  test("updateRole - 500 - Error Updating Role By Code", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "PUT",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Role",
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
      throw new Error("Error Updating Role By code");
    }
  });
});
