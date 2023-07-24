import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../Membership/membershipFunction";

describe("Membership", () => {
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

  test("createMembership - 201 - Create Membership", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Membership",
      body: {
        _id: "63e7008863a544cc6e0c6796",
        code: "4f053c44-1051-47f1-adab-794b4a1030a7",
        name: "Ilimitado",
        restrictions: {
          courses: 999,
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

  test("createMembership - 500 - Catch Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Membership",
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
      throw new Error("Error creating membership");
    }
  });

  test("getMemberships - 200 - Get Memberships", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Membership",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("membership");
    const insertedDocuments = [
      {
        code: "86c0a346-05dc-4b71-bc0a-1d308c7f2e71",
        name: "Ilimitado Basic",
        restrictions: {
          courses: 50,
        },
      },
      {
        code: "6846d15c-3ec3-49d8-82c7-37239d08f2af",
        name: "Ilimitado Lite",
        restrictions: {
          courses: 100,
        },
      },
      {
        code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d",
        name: "Ilimitado Plus",
        restrictions: {
          courses: 500,
        },
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

  test("getMemberships - 204 - Unknow Documents", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Membership",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    db.collection("membership");

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(204);
    expect(resultado.body).toEqual(undefined);
  });

  test("getMemberships - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      url: "/Membership",
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
      throw new Error("Can't get memberships");
    }
  });

  test("getMembership - 200 - Get Membership", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: { membershipCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Membership",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("membership");
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
    expect(resultado.body[0]).toMatchObject(insertedDocuments);
  });

  test("getMembership - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Membership",
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
      throw new Error("Error getting membership by code");
    }
  });

  test("updateMembership - 201 - Updated Membership", async () => {
    const body = {
      code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d",
      name: "Ilimitado Plus update",
      restrictions: {
        courses: 500,
      },
    };

    const db = client.db();
    const collection = db.collection("membership");
    const insertedDocuments = {
      code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d",
      name: "Ilimitado Plus",
      restrictions: {
        courses: 500,
      },
    };

    await collection.insertOne(insertedDocuments);

    const mockRequest: Partial<HttpRequest> = {
      method: "PUT",
      params: { code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d" },
      url: "/Membership",
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
        code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d",
        name: "Ilimitado Plus",
        restrictions: {
          courses: 500,
        },
      },
      ok: 1,
    });
  });

  test("updateMembership - 500 - Error Updating Membership By Code", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "PUT",
      params: { code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Membership",
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
      throw new Error("Error Updating Membership By code");
    }
  });

  test("deleteMembership - 200 - Delete Membership", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "DELETE",
      params: { code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d" },
      url: "/Membership",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("membership");
    const insertedDocuments = {
      code: "2d4b2316-84f6-4e1d-9be2-10c77de9631d",
      name: "Ilimitado Plus",
      restrictions: {
        courses: 500,
      },
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

  test("deleteMembership - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "DELETE",
      params: { code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      url: "/Membership",
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
      throw new Error("Error deleting membership by code");
    }
  });
});
