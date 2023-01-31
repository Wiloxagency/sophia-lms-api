import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database =  createConnection()
var courses = []

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        const db =  await database
        const Users = db.collection('user')
        const typedEmail = req.body.email
        const typedPassword = req.body.password
        const resp = Users.aggregate([
            {
                '$match': {
                  'email': typedEmail,
                  'password': typedPassword
                }
              }])

        const body = await resp.toArray()

        if (body) {

            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": body[0]
            }
        } else {
            context.res = {
                "status": 404,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "User not found"
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