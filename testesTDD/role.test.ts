import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getRoles } from "../Role/roleFunction";

describe("Get all roles", () => {
  let mockRequest: Partial<HttpRequest>;
  let mockResponse: Partial<Context>;

  test("200 - roles", async () => {
    jest.setTimeout(10000);
    const resultado = await getRoles(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(200);
    expect(
      resultado.body.map((obj: any) => ({ ...obj, _id: obj._id.toString() }))
    ).toEqual([
      {
        _id: "63e6feb863a544cc6e0c678c",
        name: "Administrator",
        code: "7c19ca4a-6fa0-4f05-8cca-49331f681d1b",
        permissions: ["ADMINISTRATOR.MAIN"],
      },
      {
        _id: "63e6feb863a544cc6e0c678d",
        name: "Content Manager",
        code: "a8473bfd-76df-42d2-a8d6-ade33ee935b0",
        permissions: ["EDITOR.MAIN"],
      },
      {
        _id: "63e6feb863a544cc6e0c678e",
        name: "Student",
        code: "7f50d2e4-10b4-4145-91d7-cc31bf3cf40c",
        permissions: ["STUDENT.MAIN"],
      },
      {
        _id: "6438a03f56baf389667b9afc",
        name: "Estudiante",
        code: "30fbb614-d08f-494b-9c4b-52701a3c6906",
        permissions: ["STUDENT.MAIN"],
      },
      {
        _id: "6447d1a8af5b83efcaa2b25c",
        name: "Superadmin",
        code: "5a49606b-caac-4b4b-96e0-9c5d0ae6a93c",
        permissions: ["ORGANIZATION.CREATION"],
      },
      {
        _id: "6495bb99e87397191e19ba8e",
        code: "333333bd-b735-453d-b1cb-cf4fc6a2pp32",
        name: "Instructor",
        permissions: [],
      },
    ]);
  });
});
