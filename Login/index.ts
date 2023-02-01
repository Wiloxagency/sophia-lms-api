import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
const bcrypt = require("bcrypt")
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        const db = await database
        const Users = db.collection('user')
        const typedEmail = req.body.email
        const typedPassword = req.body.password
        const resp = Users.aggregate([
            {
                '$match': {
                    'email': typedEmail
                }
            }])

        const body = await resp.toArray()
        console.info("body -->", body)

        if (body && body.length > 0) {

            const savedPassword = body[0].password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(typedPassword, salt);
            //req.body.password = hash
            const found = bcrypt.compareSync(savedPassword, hash); // true

            console.info("found -->", found)
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": body[0]
            }

        } else {
            context.res = {
                "status": 404,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "User not found"
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