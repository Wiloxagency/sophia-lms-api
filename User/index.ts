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
        var receivedPassword = req.body.password
        
        const hash = bcrypt.hashSync(receivedPassword, 10)
        req.body.password = hash
        const Users = db.collection('user')
        const check = Users.findOne({ email: req.body.email })
        var body = null
        body = await check
        if (body) {
            context.res = {
                "status": 203,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {"email": "Exists"}
            }
        } else {
            const resp = Users.insertOne(req.body)
            body = await resp
            
            if (body.acknowledged) {
                const user = await Users.findOne({_id: body.insertedId})
                delete body.password
                context.res = {
                    "status": 201, 
                    "headers": {
                        "Content-Type": "application/json"
                    },
                
                    "body": user
            }}
            
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