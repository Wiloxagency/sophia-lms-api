import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database =  createConnection()
var courses = []

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        const db =  await database
        const collection =  db.collection("course");

        const results = await collection.find({}).limit(10).toArray();
        courses = results

        context.res = {

            "headers": {

                "Content-Type": "application/json"

            },

            "body": courses

        }

    } catch (error) {

        context.res = {

            "status": error.status,

            "headers": {

                "Content-Type": "application/json"

            },

            "body": {

                "message": error.toString()

            }

        }

    }

 };

export default httpTrigger