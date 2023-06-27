import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { login } from "../../Login/loginFunction";
import { ObjectId } from "bson";

describe("Login", () => {
  let mockRequest: Partial<HttpRequest>;
  let mockResponse: Partial<Context>;

  afterEach(() => {
    mockRequest = {};
    mockResponse = {};
  });

  test("Login successfully", async () => {
    mockRequest = {
      body: { email: "kelvin@wilox.xom", password: "kelvin@wilox.xom" },
    };
    mockResponse = {};

    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(200);
  });

  test("Invalid password", async () => {
    mockRequest = {
      body: { email: "kelvin@wilox.xom", password: "kelvins@wilox.xom" },
    };
    const expectedResult = { message: "Invalid password" };

    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(203);
    expect(resultado.body).toEqual(expectedResult);
  });

  test("Invalid email", async () => {
    mockRequest = {
      body: { email: "kewdn@wilox.xom", password: "kelvins@wilox.xom" },
    };

    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(204);
  });

  test("Authentication error", async () => {
    mockRequest = {
      body: {},
    };

    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(500);
    expect(resultado.body).toEqual({
      message: "Authentication error",
    });
  });
});
