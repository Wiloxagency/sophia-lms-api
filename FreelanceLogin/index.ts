import { createToken, verifyToken } from "./jwt"; 
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
//import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");

const database = createConnection()

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void>  {

  if (!req.body || !req.body.email || !req.body.password ) {
    context.res = {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: { error: "Missing properties in the body, it needs email and password" },
    };
    return
  }

  try {
    const db = await database;
    var { email, password } = req.body
    const regex = new RegExp(email)
    const Users = db.collection('freelanceUser')
    const resp = Users.findOne({ email: { '$regex': new RegExp(regex, 'i') } })
    const body = await resp;

    if (body) {
      const savedPassword = body.password
      const found = bcrypt.compareSync(password, savedPassword)

      if (found === false) {
        context.res = {
          "status": 203,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": { "message": "Invalid password" }
        }

      } else {
        //const resp = Users.aggregate(
        //  userAggregation( {"code": body.code}, {})
        //)
        //const body2 = await resp.toArray()
        //delete body2[0].password
        context.res = {
          "status": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            user: body,
            //token: createToken(body)//error
          }
        }
      }

    } else {
      context.res = {
        "status": 204,
        "headers": {
          "Content-Type": "application/json"
        }
      }
    }
  } catch (error) {
    context.res = {
      "status": 500,
      "headers": {
        "Content-Type": "application/json"
      },

      "body": {
        "message": "Authentication error",
        "error": error.message
      }
    }
  }
};

export default httpTrigger