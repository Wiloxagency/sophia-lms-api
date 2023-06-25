import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getRoles } from "../Role/roleFunction";

describe("Get all roles", () => {
  let mockRequest: Partial<HttpRequest>;
  let mockResponse: Partial<Context>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
  });

  afterEach(() => {
    mockRequest = {};
    mockResponse = {};
  });

  test("200 - roles", async () => {
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

    const resultado = await getRoles(
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
});
