import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createCourse = async (createdCourses: number) => {

        try {

            const db = await database
            const Courses = db.collection('course')
            const resp = Courses.insertOne(req.body)

            const body = await resp

            if (body) {

                context.res = {
                    "status": 201,
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
                        "message": "Error creating course"
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
                    "message": error.toString()
                }
            }

        }
    }

    const updateCourse = async (codeCourse: string) => {

        delete req.body._id

        try {

            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.findOneAndUpdate({ 'code': codeCourse }, { $set: req.body })
            const body = await resp

            if (body) {

                context.res = {
                    "status": 201,
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
                        "message": "Error updating course by code"
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
                    "message": "Error updating course by code"
                }
            }

        }
    }

    switch (req.method) {
        case "POST":
            await createCourse(parseInt(req.params.createdCourses))
            break;

        case "PUT":
            await updateCourse(req.params.courseCode)
            break;

        default:
            break;
    }


}

export default httpTrigger;