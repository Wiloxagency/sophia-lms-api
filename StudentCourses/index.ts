import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const getCourses = async () => {
        try {
            const db = await database
            const Groups = db.collection('group')
            const resp = Groups.aggregate(
                [
                    {
                        '$match': {
                            'users.code': req.params.userCode,
                            'status': 'Activo'
                        }
                    }, {
                        '$lookup': {
                            'from': 'course',
                            'localField': 'courseCode',
                            'foreignField': 'code',
                            'as': 'courses'
                        }
                    }, {
                        '$unwind': {
                            'path': '$courses'
                        }
                    }, {
                        '$project': {
                            'course': '$courses'
                        }
                    }, {
                        '$match': {
                            'course.approvalStatus': 'Approved'
                        }
                    }
                ]
            )
            const body = await resp.toArray()
            if (body && body[0]) {
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
                        "message": "Error getting courses by code"
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
                    "message": "Error getting courses by code"
                }
            }
        }
    }

    switch (req.method) {
        case "GET":
            await getCourses()
            break;
        default:
            break;
    }
}

export default httpTrigger;