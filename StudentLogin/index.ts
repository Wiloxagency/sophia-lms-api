import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
//import { userAggregation } from "../User/aggregation";
import bcrypt = require("bcryptjs");

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  if (!req.body || !req.body.email || !req.body.password) {
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
    const Students = db.collection('student')
    const resp = Students.findOne({ email: { '$regex': new RegExp(regex, 'i') } })
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
        const responseRegistration = await getRegistrationByCode(body.code);

        if (responseRegistration.status == 200) {
          context.res = {
            "status": 200,
            "headers": {
              "Content-Type": "application/json"
            },
            "body": {
              student: body,
              registrations: responseRegistration.body
              //token: createToken(body)//error
            }
          }
        } else {
          context.res = {
            "status": 200,
            "headers": {
              "Content-Type": "application/json"
            },
            "body": {
              student: body
            }
          }

        }
      }

    } else {
      context.res = {
        "status": 203,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Authentication error"
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

async function getRegistrationByCode(studentcode: string) {
  try {
    const db = await database;
    const Registrations = db.collection("registration");

    const resp = Registrations.aggregate([
      {
        $match: {
          studentcode: studentcode,
        },

      },
      {
        $project: {
          _id: 0,
          coursecode: 1,
          value: 1,
          dataCreated: 1,
        }
      },

      { 
        $sort: { 
          dataCreated: -1 
        } 
      }
    ]);

    const body = await resp.toArray();

    if (body) {
      return {
        status: 200,
        body: body,
      };

    } else {
      return {
        status: 500,
        body: {
          message: "Error getting campus by code",
        },
      };
    }
  } catch (error) {
    return {
      status: 500,
      body: {
        message: "Error getting campus by code",
      },
    };
  }
};
