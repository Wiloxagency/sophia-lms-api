import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { nextTick } from "process";
import { phraseKeywords } from "../shared/gpt3.prompt";
import { createConnection } from "../shared/mongo";
const bcrypt = require("bcrypt")

const database =  createConnection()
var users = []

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        const db =  await database
        const Users = db.collection('user')
        const resp = Users.insertOne(req.body)
        var pass = req.body.password
        const body = await resp
        const hash = bcrypt.hashSync(pass, 10);
        bcrypt.compareSync(pass, hash);
        if (body) {
            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": hash
            }
            
        }

    } catch (error) {
             context.res = {

            "status": 500,

            "headers": {

                "Content-Type": "application/json"

            },

            "body": {

                "message": "Create user error"

            }

        }

    }

 };

export default httpTrigger