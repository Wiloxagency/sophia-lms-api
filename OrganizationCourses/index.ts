import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";

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