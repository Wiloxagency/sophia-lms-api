import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createMembership = async () => {

        try {

            const db = await database
            const Memberships = db.collection('membership')
            const resp = Memberships.insertOne(req.body)

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
                        "message": "Error creating membership"
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

    const deleteMembership = async () => {


        try {

            const db = await database

            const Memberships = db.collection('membership')

            const resp = Memberships.deleteOne({ 'code': req.params.code })
            const body = await resp

            if (body) {

                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },

                    "body": body
                }
            }
        } catch (error) {
        }
    }

    const updateMembership = async (code: string) => {

        delete req.body._id

        try {

            const db = await database
            const Memberships = db.collection('membership')

            const resp = Memberships.findOneAndUpdate({ 'code': code }, { $set: req.body })
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
                        "message": "Error updating membership by code"
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
                    "message": "Error updating membership by code"
                }
            }

        }
    }

    const getMembership = async (code: string) => {


        try {

            const db = await database
            const Memberships = db.collection('membership')

            const resp = Memberships.aggregate(
                [
                    {
                        '$match': {
                            'code': code
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
                        "message": "Error getting membership by code"
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
                    "message": "Error getting membership by code"
                }
            }

        }
    }

    const getMemberships = async () => {


        try {

            const db = await database

            const Memberships = db.collection('membership')

            const resp = Memberships.find({})

            const body = await resp.toArray()

            if (body && body.length > 0) {
                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
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
                "statusText": "Can't get memberships"
            }
        }
    }

    

    switch (req.method) {
        case "POST":
            await createMembership()
            break;
        case "PUT":
            await updateMembership(req.params.code)
            break;
        case "GET":
            if (req.params.code) {
                await getMembership(req.params.code)
            } else {
                await getMemberships()
            }
            break;
        case "DELETE":
            await deleteMembership()
            break;

        default:
            break;
    }

}

export default httpTrigger;