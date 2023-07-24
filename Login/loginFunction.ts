import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
const database = createConnection();

export const login: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  try {
    const db = await database;
    var { email, password } = req.body;
    const regex = new RegExp(req.body.email);
    const Users = db.collection("user");
    const resp = Users.findOne({ email: { $regex: new RegExp(regex, "i") } });
    const body = await resp;
    if (body) {
      const savedPassword = body.password;
      const found = bcrypt.compareSync(password, savedPassword);

      if (found === false) {
        return {
          status: 203,
          headers: {
            "Content-Type": "application/json",
          },
          body: { message: "Invalid password" },
        };
      } else {
        const resp = Users.aggregate(userAggregation({ code: body.code }, {}));
        const body2 = await resp.toArray();
        delete body2[0].password;
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body2[0],
        };
      }
    } else {
      return {
        status: 204,
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
  } catch (error) {
    return {
      status: 500,

      headers: {
        "Content-Type": "application/json",
      },

      body: {
        message: "Authentication error",
      },
    };
  }
};
