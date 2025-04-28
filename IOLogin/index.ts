import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt from "bcryptjs"; // use ES import
import { saveLog } from "../shared/saveLog";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const db = await database;
    const { email, password } = req.body;
    
    if (!email || !password) {
      context.res = {
        status: 400,
        body: { message: "Faltan campos requeridos." },
      };
      return;
    }

    const Users = db.collection("ioUser");
    const user = await Users.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }, // match exactly ignoring case
    });

    if (!user) {
      context.res = {
        status: 204,
        body: { message: "Usuario no encontrado." },
      };
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      context.res = {
        status: 203,
        body: { message: "Contraseña incorrecta." },
      };
      return;
    }

    const userAggregationResponse = await Users.aggregate(
      userAggregation({ code: user.code }, {})
    ).toArray();

    const userWithoutPassword = { ...userAggregationResponse[0] };
    delete userWithoutPassword.password;

    context.res = {
      status: 200,
      body: userWithoutPassword,
    };
  } catch (error) {
    await saveLog(
      `Authentication error for user: ${req.body.email}, error: ${error.message}`,
      "Error",
      "AzureFunction()",
      "Login"
    );

    context.res = {
      status: 500,
      body: { message: "Authentication error." },
    };
  }
};

export default httpTrigger;
