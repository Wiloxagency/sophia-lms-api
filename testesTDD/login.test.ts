import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { login } from "../Login/loginFunction";
import { ObjectId } from "bson";

describe("Login", () => {
  let mockRequest: Partial<HttpRequest>;
  let mockResponse: Partial<Context>;

  beforeEach(() => {
    mockRequest = {
      body: { email: "kelvin@wilox.xom", password: "kelvin@wilox.xom" }, // Defina o corpo da requisição aqui
    };
    mockResponse = {};
  });

  test("Login succesfully", async () => {
    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(200);
    expect(resultado.body).toMatchObject({
      _id: new ObjectId("647a31b7f87f8a063aee663d"),
      name: "New User",
    });
  });
});
