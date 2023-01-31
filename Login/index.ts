import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
const bcrypt = require("bcrypt")
const database =  createConnection()
var courses = []

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        const db =  await database
        const Users = db.collection('user')
        const typedEmail = req.body.email
        const typedPassword = req.body.password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(typedPassword, salt);
        req.body.password = hash
        bcrypt.compareSync(typedEmail, typedPassword, hash); // true
        const resp = Users.aggregate([
            {
                '$match': {
                  'email': typedEmail,
                  'password': typedPassword
                }
              }])

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

            "status": error.status,

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