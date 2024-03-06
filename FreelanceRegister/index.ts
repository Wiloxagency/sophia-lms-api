import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
const database = createConnection()
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {
  function hashPassword(textPassword: string): string {
    return bcrypt.hashSync(textPassword, 10);
  }

  // const createUser = async () => {
  let newUser = req.body;

  if (!newUser || !newUser.email || !newUser.password || !newUser.name || !newUser.phone ) {
    context.res = {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: { error: "Missing properties in the body, it needs email, password, name, phone" },
    };
    return
  }

  try {
    console.log("client in the endpoint");
    const db = await database;
    newUser.password = hashPassword(req.body.password);
    newUser["dataCreated"] = new Date();
    newUser["code"] = uuidv4();
    const Users = db.collection("freelanceUser");
    const check = Users.findOne({ email: req.body.email });
    var body = null;
    body = await check;
    if (body) {
      context.res = {
        status: 203,
        headers: {
          "Content-Type": "application/json",
        },
        body: { email: "Exists" },
      };
      return
    } else {
      const resp = Users.insertOne(newUser);
      body = await resp;
      if (body.acknowledged) {
        const user = await Users.findOne({ _id: body.insertedId });
        delete newUser.password;
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: user,
        };
        return
      }
    }
  } catch (error) {
    console.log("Error has ocurred", error)
    return context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      statusText: "Create user error",
    };
  }
  // };

  // createUser()
};

export default httpTrigger