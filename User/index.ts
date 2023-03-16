import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { userAggregation } from "./aggregation";
//import bcrypt = require("bcrypt");

const database = createConnection()
var users = []

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    // const createUser = async () => {
    //     console.log(req.body)
    //     try {
    //         const db = await database
    //         var receivedPassword = req.body.password
    //         const hash = bcrypt.hashSync(receivedPassword, 10)
    //         req.body.password = hash
    //         const Users = db.collection('user')
    //         const check = Users.findOne({ email: req.body.email })
    //         var body = null
    //         body = await check
    //         if (body) {
    //             context.res = {
    //                 "status": 203,
    //                 "headers": {
    //                     "Content-Type": "application/json"
    //                 },
    //                 "body": { "email": "Exists" }
    //             }
    //         } else {
    //             const resp = Users.insertOne(req.body)
    //             body = await resp
    //             if (body.acknowledged) {
    //                 const user = await Users.findOne({ _id: body.insertedId })
    //                 delete body.password
    //                 context.res = {
    //                     "status": 201,
    //                     "headers": {
    //                         "Content-Type": "application/json"
    //                     },
    //                     "body": user
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         context.res = {
    //             "status": 500,
    //             "headers": {
    //                 "Content-Type": "application/json"
    //             },
    //             "statusText": "Create user error"
    //         }
    //     }
    // }

    const getUser = async (userCode: string) => {

        try {
            const db = await database
            const Users = db.collection('user')
            const resp = Users.aggregate(
                userAggregation(userCode)
            )
            const body = await resp.toArray()
            if (body && body.length > 0) {
                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body[0]
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

        }


    }

    const getUserByEmail = async () => {
        try {
            const db = await database
            const Users = db.collection('user')
            const resp = Users.findOne({ email: req.query.userEmail })
            const body = await resp
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
                    "status": 204,
                    "headers": {
                        "Content-Type": "application/json"
                    }
                }
            }
        } catch (error) { }
    }

    const getUsers = async () => {
        try {
            const db = await database
            const Users = db.collection('user')
            const resp = Users.aggregate([
                {
                    '$match': {
                        // 'organizationCode': req.params.organizationCode
                    }
                },
                {
                    '$sort':
                        { '_id': -1 }
                }
            ])
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
                "statusText": "Can't delete user"
            }
        }
    }

    const updateUser = async (userCode: string) => {
        delete req.body._id
        try {
            const db = await database
            const Users = db.collection('user')
            const resp = Users.findOneAndUpdate({ 'code': userCode }, { $set: req.body })
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
                        "message": "Error updating user by code"
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
                    "message": "Error updating user by code"
                }
            }
        }
    }

    const deleteUser = async () => {
        try {
            const db = await database
            const Users = db.collection('user')

            const resp = Users.deleteOne({ 'code': req.params.userCode })
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

    switch (req.method) {
        case "POST":
            //await createUser()
            break;

        case "PUT":
            await updateUser(req.params.userCode)
            break;

        case "GET":
            if (req.params.userCode) {
                await getUser(req.params.userCode)
            } else if (req.query.userEmail) {
                await getUserByEmail()
            } else {
                await getUsers()
            }
            break;

        case "DELETE":
            await deleteUser()
            break;

        default:
            break;
    }


};

export default httpTrigger