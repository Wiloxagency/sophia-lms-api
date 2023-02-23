import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createGroup = async () => {

        try {

            const db = await database
            const Groups = db.collection('group')
            const resp = Groups.insertOne(req.body)

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
                        "message": "Error creating group"
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

    const updateGroup = async (groupCode: string) => {

        delete req.body._id

        try {

            const db = await database
            const Groups = db.collection('group')

            const resp = Groups.findOneAndUpdate({ 'code': groupCode }, { $set: req.body })
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
                        "message": "Error updating group by code"
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
                    "message": "Error updating group by code"
                }
            }

        }
    }

    const getGroup = async (groupCode: string) => {


        try {

            const db = await database
            const Groups = db.collection('group')

            const resp = Groups.aggregate(
                [
                    {
                        '$match': {
                            'code': groupCode
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
                    "body": body[0]
                }
            } else {
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error getting group by code"
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
                    "message": "Error getting group by code"
                }
            }

        }
    }

    const getGroups = async () => {

    }

    switch (req.method) {
        case "POST":
            await createGroup()
            break;

        case "PUT":
            await updateGroup(req.params.groupCode)
            break;

        case "GET":
            if (req.params.courseCode) {
                await getGroup(req.params.groupCode)
            } else {
                await getGroups()
            }

            break;

        default:
            break;
    }

}

export default httpTrigger;