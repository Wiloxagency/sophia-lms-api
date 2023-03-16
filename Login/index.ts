import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  try {
    console.log(req.body)
    const db = await database
    var { email, password } = req.body
    const regex = new RegExp(req.body.email)
    const Users = db.collection('user')
    const resp = Users.findOne({ email: { '$regex': new RegExp(regex, 'i') } })
    const body = await resp
    console.info("body -->", body)
    if (body) {
      const savedPassword = body.password
      const found = bcrypt.compareSync(password, savedPassword)
      //console.info ("hashDB -->", savedPassword)
      //console.info ("found -->", found)

      if (found === false) {
        context.res = {
          "status": 203,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": { "message": "Invalid password" }
        }

      } else {
        const resp = Users.aggregate(
          userAggregation(body.code)
        )
        const body2 = await resp.toArray()
        delete body2[0].password
        context.res = {
          "status": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": body2[0]
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

        "message": "Authentication error"

      }

    }

  }

};

export default httpTrigger