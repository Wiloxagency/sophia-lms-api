import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createOrganization = async () => {

        try {

            const db = await database
            const Organizations = db.collection('organization')
            const resp = Organizations.insertOne(req.body)

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
                        "message": "Error creating organization"
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

    const deleteOrganization = async () => {


        try {

            const db = await database

            const Organizations = db.collection('organization')

            const resp = Organizations.deleteOne({ 'organizationCode': req.params.organizationCode })
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

    const updateOrganization = async (organizationCode: string) => {

        delete req.body._id

        try {

            const db = await database
            const Organizations = db.collection('organization')

            const resp = Organizations.findOneAndUpdate({ 'organizationCode': organizationCode }, { $set: req.body })
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
                        "message": "Error updating organization by code"
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
                    "message": "Error updating organization by code"
                }
            }

        }
    }

    const getOrganization = async (organizationCode: string) => {


        try {

            const db = await database
            const Organizations = db.collection('organization')

            const resp = Organizations.aggregate(
                [
                    {
                        '$match': {
                            'organizationCode': organizationCode
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
                        "message": "Error getting organization by code"
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
                    "message": "Error getting organization by code"
                }
            }

        }
    }

    const getOrganizations = async () => {


        try {

            const db = await database

            const Organizations = db.collection('organization')

            const resp = Organizations.find({})

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
                "statusText": "Can't get organizations"
            }
        }
    }

    

    switch (req.method) {
        case "POST":
            await createOrganization()
            break;
        case "PUT":
            await updateOrganization(req.params.organizationCode)
            break;
        case "GET":
            if (req.params.organizationCode) {
                await getOrganization(req.params.organizationCode)
            } else {
                await getOrganizations()
            }
            break;
        case "DELETE":
            await deleteOrganization()
            break;

        default:
            break;
    }

}

export default httpTrigger;