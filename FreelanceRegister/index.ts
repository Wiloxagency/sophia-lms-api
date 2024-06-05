import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
//import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
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

  const createUser = async () => {
    let newUser = req.body;

    if (!newUser || !newUser.email || !newUser.password || !newUser.name || !newUser.phone) {
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
  };

  const deleteFreelance = async () => {
    try {
      const db = await database;
      const Users = db.collection("freelanceUser");

      const resp = Users.deleteOne({ email: req.headers.email });
      const body = await resp;
      if (body) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting user by email",
        },
      };
    }
  };

  const updateFreelance = async () => {
    try {
      const db = await database;
      const Users = db.collection("freelanceUser");
      const resp = Users.findOneAndUpdate(
        { email: req.headers.email },
        { $set: req.body }
      );

      const body = await resp;

      if (body) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating user freelance by email",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating user freelance  by email",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      await createUser();
      break;
    case "PUT":
      await updateFreelance();
      break;
    case "DELETE":
      await deleteFreelance();
      break;
    default:
      break;
  }
};

export default httpTrigger