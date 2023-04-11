import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const ownerCode = req.params.userCode
    console.info("ownerCode-->", ownerCode)

    try {

        db = await database
        const Courses = db.collection('course')
        const resp = Courses.find({ author_code: ownerCode }).sort({ _id: -1 })
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
            await saveLog(`Error Getting courses by owner: ${ownerCode} `, "Error", "AzureFunction()", "Users/{userCode}/CreatorCourses")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error Getting courses by owner"
                }
            }

        }

    } catch (error) {
        await saveLog(`Error in CourseByOwner method: ${ownerCode}, error: ${error.message} `, "Error", "AzureFunction()", "Users/{userCode}/CreatorCourses")
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error in CourseByOwner method"
            }
        }
    }

};

export default httpTrigger;