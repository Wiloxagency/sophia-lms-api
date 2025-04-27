import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import bcrypt = require("bcryptjs");
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
        body: { message: "Email and password are required" },
      };
      return;
    }

    const Users = db.collection("ioUser");

    // Check if user already exists
    const existingUser = await Users.findOne({
      email: { $regex: new RegExp(email, "i") },
    });
    if (existingUser) {
      context.res = {
        status: 409, // Conflict
        body: { message: "User already exists" },
      };
      return;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await Users.insertOne(newUser);

    context.res = {
      status: 201, // Created
      body: { message: "User created successfully" },
    };
  } catch (error) {
    await saveLog(
      `Registration error for user: ${req.body.email}, error: ${error.message}`,
      "Error",
      "AzureFunction()",
      "IORegister"
    );

    context.res = {
      status: 500,
      body: { message: "Registration failed" },
    };
  }
};

export default httpTrigger;
