import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        db = await database
        const Courses = db.collection('course')
        const resp = Courses.find({ organizationCode: req.params.organizationCode }).sort({ _id: -1 })
        const body = await resp.toArray()
        if (body) {
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": body
            }
        } else {
            await saveLog(`Error Getting organization courses for: ${req.params.organizationCode}`, "Error", "AzureFunction()", "Organizations/{organizationCode}/courses")

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error Getting organization courses"
                }
            }
        }
    } catch (error) {
        await saveLog(`Error in organizationCourse method for: ${req.params.organizationCode}, error ${error.message}`, "Error", "AzureFunction()", "Organizations/{organizationCode}/courses")

        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error in organizationCourse method"
            }
        }
    }
}

export default httpTrigger