import { createToken, verifyToken } from "./jwt";


import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
const database = createConnection()
import { MongoClient } from "mongodb";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {


  // const createUser = async () => {
  // let newUser = req.body;

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
    console.log("client in login endpoint");
    const db = await database;
    var { email, password } = req.body
    const regex = new RegExp(email)
    const Users = db.collection('freelanceUser')
    const resp = Users.findOne({ email: { '$regex': new RegExp(regex, 'i') } })
    const body = await resp;


    if (body) {
      const savedPassword = body.password
      const found = bcrypt.compareSync(password, savedPassword)
      console.log("found", found)
      console.log(body)

      if (found === false) {
        context.res = {
          "status": 203,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "message": "Invalid password"
          }
        }

      } else {
        console.log("body", body)
        body.password = ''

        // const resp = Users.aggregate(
        //   userAggregation( {"code": body.code}, {})
        // )
        // console.log("resp", resp)
        // const body2 = await resp.toArray()
        // delete body2[0].password
        context.res = {
          "status": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            user: body,
            token: createToken(body)
          }
        }
        return;
      }

      context.res = {
        status: 203,
        headers: {
          "Content-Type": "application/json",
        },
        body: { email: "Exists" },
      };
      return

    } else {
      console.log("User not found")
      context.res = {
        status: 203,
        headers: {
          "Content-Type": "application/json",
        },
        body: { error: "User not found" },
      };
      return;
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

export default httpTrigger