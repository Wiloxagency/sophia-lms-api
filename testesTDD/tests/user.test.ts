import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../User/userFunction";

describe("User", () => {
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

  test("createUser - 201 - Create User", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Users",
      body: {
        name: "teste user",
        last_access: "",
        status: "Activo",
        code: "11111111-bace-4897-8985-002703e762aa",
        email: "testeuser@teste.com",
        role: "Estudiante",
        phone: "48995552145",
        company: "Larragaña",
        position: "Usuario",
        password: "1111c2e8-1111-1111-8985-002703e762aa",
        organizationCode: "11116c99-1111-1111-aa05-a548e6956e0c",
      },
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(201);
    expect(resultado.body).toHaveProperty("name", "teste user");
    expect(resultado.body).toHaveProperty("status", "Activo");
    expect(resultado.body).toHaveProperty("email", "testeuser@teste.com");
  });

  test("createUser - 203 - Email Exists", async () => {
    const db = client.db();
    const collection = db.collection("user");

    const existingUser = {
      name: "usuário existente",
      last_access: "",
      status: "Activo",
      code: "22222222-bace-4897-8985-002703e762aa",
      email: "testeuser@teste.com",
      role: "Estudiante",
      phone: "48995552145",
      company: "Larragaña",
      position: "Usuario",
      password: "2222c2e8-1111-1111-8985-002703e762aa",
      organizationCode: "22226c99-1111-1111-aa05-a548e6956e0c",
    };

    await collection.insertOne(existingUser);

    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Users",
      body: existingUser,
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(203);
    expect(resultado.body).toEqual({ email: "Exists" });
  });

  test("createUser - 500 - Catch Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      url: "/Users",
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
      throw new Error("Create user error");
    }
  });

  test("getUser - 200 - Ok", async () => {
    const db = client.db();
    const collection = db.collection("user");
    const insertedDocuments = {
      name: "teste user dw",
      last_access: "",
      status: "Activo",
      code: "11111111-1111-1111-8985-002703e762aa",
      email: "edededede@teste.com",
      role: "Estudiante",
      phone: "48999855214",
      company: "Wilox",
      position: "Usuario",
      password: "2211c2e8-1111-1111-8985-002703e762aa",
      organizationCode: "4de726c3-0e04-436b-ae50-f8752a2734aa",
    };

    await collection.insertOne(insertedDocuments);

    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: { code: "11111111-1111-1111-8985-002703e762aa" },
      query: { email: "edededede@teste.com" },
      url: "/Users",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(200);
    expect(resultado.body).toMatchObject([
      {
        name: "teste user dw",
        last_access: "",
        status: "Activo",
        code: "11111111-1111-1111-8985-002703e762aa",
        email: "edededede@teste.com",
        role: "Estudiante",
        phone: "48999855214",
        company: "Wilox",
        position: "Usuario",
        password: "2211c2e8-1111-1111-8985-002703e762aa",
        organizationCode: "4de726c3-0e04-436b-ae50-f8752a2734aa",
      },
    ]);
  });

  test("getUser - 204 - User Not Found", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: { code: "11111111-1111-1111-8985-002703e762aa" },
      query: { email: "edededede@teste.com" },
      url: "/Users",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(204);
  });

  test("getUser - 500 - Catch Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Users",
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

  test("getUsers - 200 - Get Users", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Users",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("user");
    const insertedDocuments = [
      {
        name: "teste user",
        last_access: "",
        status: "Activo",
        code: "11111111-bace-4897-8985-002703e762aa",
        email: "testeuser@teste.com",
        role: "Estudiante",
        phone: "48995552145",
        company: "Larragaña",
        position: "Usuario",
        password: "1111c2e8-1111-1111-8985-002703e762aa",
        organizationCode: "11116c99-1111-1111-aa05-a548e6956e0c",
      },
      {
        name: "teste user 2",
        last_access: "",
        status: "Activo",
        code: "22111111-bace-4897-8985-002703e762aa",
        email: "testeuser@teste.com",
        role: "Estudiante",
        phone: "48995552145",
        company: "Larragaña",
        position: "Usuario",
        password: "2211c2e8-1111-1111-8985-002703e762aa",
        organizationCode: "11116c99-1111-1111-aa05-a548e6956e0c",
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

  test("getUsers - 204 - Unknow Documents", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Users",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    db.collection("user");

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(204);
    expect(resultado.body).toEqual(undefined);
  });

  test("getUsers - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "GET",
      params: {},
      query: {},
      url: "/Users",
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

  test("updateUser - 201 - Updated User", async () => {
    const body = {
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
      name: "Kelvin Seidel update",
    };

    const db = client.db();
    const collection = db.collection("user");
    const insertedDocuments = {
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
      name: "Kelvin Seidel",
    };

    await collection.insertOne(insertedDocuments);

    const mockRequest: Partial<HttpRequest> = {
      method: "PUT",
      params: { userCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      query: {},
      url: "/Users",
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
        name: "Kelvin Seidel",
      },
      ok: 1,
    });
  });

  test("updateUser - 500 - Error Updating User By Code", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "PUT",
      params: { roleCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      query: {},
      url: "/Users",
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
      throw new Error("Error Updating User By code");
    }
  });

  test("deleteUser - 200 - Delete User", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "DELETE",
      params: { userCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      query: {},
      url: "/Users",
      body: {},
    };

    const mockResponse: Partial<Context> = {};

    const db = client.db();
    const collection = db.collection("user");
    const insertedDocuments = {
      name: "Kelvin Seidel",
      code: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b",
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

  test("deleteUser - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "DELETE",
      params: { userCode: "7c55ca4a-6fa0-4f05-8cca-49331f681d1b" },
      query: {},
      url: "/Users",
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

  test("createUsersFromExcel - 500 - Error", async () => {
    const mockRequest: Partial<HttpRequest> = {
      method: "POST",
      params: {},
      query: { company: "Larragaña", excel: "true" },
      url: "/Users",
      body: {
        name: "teste user",
        last_access: "",
        status: "Activo",
        code: "11111111-bace-4897-8985-002703e762aa",
        email: "testeuser@teste.com",
        role: "Estudiante",
        phone: "48995552145",
        company: "Larragaña",
        position: "Usuario",
        password: "1111c2e8-1111-1111-8985-002703e762aa",
        organizationCode: "11116c99-1111-1111-aa05-a548e6956e0c",
      },
    };

    const mockResponse: Partial<Context> = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest,
      client
    );

    expect(resultado.status).toBe(500);
  });
});
