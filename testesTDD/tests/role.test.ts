import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { httpTrigger } from "../../Role/roleFunction";

describe("Role", () => {
  let mockRequest: Partial<HttpRequest>;
  let mockResponse: Partial<Context>;

  afterEach(() => {
    mockRequest = {};
    mockResponse = {};
  });

  test("201 - Create role", async () => {
    mockRequest = {
      method: "POST",
      params: {},
      url: "/Role",
      body: {
        code: "333333bd-b735-453d-b1cb-cf4fc6a6ee32",
        name: "Instructor",
        permissions: [],
      },
    };
    mockResponse = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(201);
    expect(resultado.body.acknowledged).toBe(true);
    expect(resultado.body.insertedId).toBeDefined();
  });

  test("200 - roles", async () => {
    mockRequest = {
      method: "GET",
      params: {},
      url: "/Role",
    };
    mockResponse = {};
    const expectedResult = [
      {
        _id: "63e6feb863a544cc6e0c678c",
        code: "7c19ca4a-6fa0-4f05-8cca-49331f681d1b",
        name: "Administrator",
        permissions: ["ADMINISTRATOR.MAIN"],
      },
      {
        _id: "63e6feb863a544cc6e0c678d",
        name: "Content Manager",
        code: "a8473bfd-76df-42d2-a8d6-ade33ee935b0",
        permissions: ["EDITOR.MAIN"],
      },
    ];

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(200);
    const resultObjects = resultado.body.map((obj: any) => ({
      ...obj,
      _id: obj._id.toString(),
    }));

    expectedResult.forEach((expectedObj) => {
      expect(resultObjects).toContainEqual(
        expect.objectContaining(expectedObj)
      );
    });
  });

  test("204 - no roles", async () => {
    mockRequest = {
      method: "GET",
      params: {},
      url: "/Role",
    };
    mockResponse = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(204);
    expect(resultado.body).toBeUndefined();
    expect(resultado.headers["Content-Length"]).toBe("0");
  });

  test("500 - Error creating role", async () => {
    mockRequest = {
      method: "POST",
      params: {},
      url: "/Role",
    };
    mockResponse = {};

    const resultado = await httpTrigger(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(500);
    expect(resultado.body.lenght).toBe(undefined);
  });
});
