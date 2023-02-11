import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
const bcrypt = require("bcrypt")
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        const db = await database
        var {email, password} = req.body
        const Users = db.collection('user')
        const resp = Users.aggregate(
            [
                {
                  '$match': {
                    'email': email
                  }
                }, {
                  '$lookup': {
                    'from': 'role',
                    'localField': 'role',
                    'foreignField': 'name',
                    'as': 'permissionsExpanded'
                  }
                }, {
                  '$unwind': {
                    'path': '$permissionsExpanded'
                  }
                }, {
                  '$addFields': {
                    'permissions': '$permissionsExpanded.permissions'
                  }
                }, {
                  '$project': {
                    'permissionsExpanded': 0
                  }
                }, {
                  '$lookup': {
                    'from': 'organization',
                    'localField': 'company',
                    'foreignField': 'name',
                    'as': 'organization'
                  }
                }, {
                  '$unwind': {
                    'path': '$organization'
                  }
                }, {
                  '$addFields': {
                    'organizationTheme': '$organization.theme'
                  }
                }, {
                  '$lookup': {
                    'from': 'theme',
                    'localField': 'organizationTheme',
                    'foreignField': 'name',
                    'as': 'organizationTheme'
                  }
                }, {
                  '$unwind': {
                    'path': '$organizationTheme'
                  }
                }, {
                  '$lookup': {
                    'from': 'membership',
                    'localField': 'organization.membershipCode',
                    'foreignField': 'code',
                    'as': 'membership'
                  }
                }, {
                  '$unwind': {
                    'path': '$membership'
                  }
                }
              ]
            )

        const body = await resp.toArray()
        console.info("body -->", body)

        if (body && body.length > 0) {
            const savedPassword = body[0].password
            const found = bcrypt.compareSync(password, savedPassword)
            //console.info ("hashDB -->", savedPassword)
            //console.info ("found -->", found)

            if (found === false) {
                context.res = {
                    "status": 203,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {"message": "Invalid password"}
                }

            } else {
                delete body[0].password,
                context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": body[0]
            }}

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

            "body": {

                "message": "Authentication error"

            }

        }

    }

};

export default httpTrigger