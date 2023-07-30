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

  test("login - 200 - Login successfully", async () => {
    const expectedResult = {
      _id: new ObjectId("647a31b7f87f8a063aee663d"),
      name: "New User",
      email: "kelvin@wilox.xom",
      last_access: "",
      status: "Activo",
      code: "c9d8679f-da69-418c-8a74-b9058279f441",
      role: "Estudiante",
      phone: "",
      company: "Wilox",
      organizationCode: "4de726c3-0e04-436b-ae50-f8752a2734aa",
      position: "Usuário",
      language: "es-MX",
      dataCreated: new Date("2023-06-02T18:15:19.277Z"),
      permissions: ["STUDENT.MAIN"],
      organization: {
        _id: new ObjectId("6467c8636d965b68bafec7d3"),
        name: "Wilox",
        organizationCode: "4de726c3-0e04-436b-ae50-f8752a2734aa",
        theme: "Predeterminado",
        membershipCode: "4f053c44-1051-47f1-adab-794b4a1030a7",
        createdCourses: "0",
        courseCategories: [
          "Gastronomía",
          "Ciencias",
          "Negocios",
          "Educación",
          "Instructivos",
          "Tecnología",
          "Entretenimiento",
          "Productividad",
          "Política",
          "Arte",
          "Finanzas",
          "Publicidad",
          "Seguridad",
          "Informática",
          "Cultura",
          "Idiomas",
          "Salud",
          "Autoayuda",
          "Deportes",
          "Turismo",
        ],
        logo: "https://lms.iasophia.com/assets/img/logo-edutecno-white.png",
      },
      organizationTheme: {
        _id: new ObjectId("63e7015b63a544cc6e0c6799"),
        name: "Predeterminado",
        properties: {
          "--sidebarColor": "#A659E9",
          "--complementaryColor": "#73C3C7",
        },
      },
      membership: {
        _id: new ObjectId("63e7008863a544cc6e0c6796"),
        code: "4f053c44-1051-47f1-adab-794b4a1030a7",
        name: "Ilimitado",
        restrictions: { courses: 999 },
      },
    };
    mockRequest = {
      body: { email: "kelvin@wilox.xom", password: "kelvin@wilox.xom" },
    };
    mockResponse = {};

    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(200);
    expect(JSON.stringify(resultado.body)).toEqual(
      JSON.stringify(expectedResult)
    );
  });

  test("login - 203 - Invalid password", async () => {
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

  test("login - 204 - Invalid email", async () => {
    mockRequest = {
      body: { email: "kewdn@wilox.xom", password: "kelvins@wilox.xom" },
    };

    const resultado = await login(
      mockResponse as Context,
      mockRequest as HttpRequest
    );

    expect(resultado.status).toBe(204);
  });

  test("login - 500 - Authentication error", async () => {
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
