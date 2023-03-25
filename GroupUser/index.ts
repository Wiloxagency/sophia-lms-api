import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
const database = createConnection()
import bcrypt = require("bcryptjs");

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    interface Group {
        users: [];
      }

    const createGroupUser = async () => {

        try {

            const db = await database;
            
            var receivedPassword = req.body.password
            const hash = bcrypt.hashSync(receivedPassword, 10)
            req.body.password = hash

            const Users = db.collection('user');
            const Groups = db.collection<Group>('group');
         
            const user = req.body;
    
            const resp = await Users.insertOne(user);
    
            const groupCode = req.params.groupCode;
    
            await Groups.findOneAndUpdate({ 'code': groupCode }, { $push: { users: user } },
            );
    
            context.res = {
                status: 201,
                headers: {
                    "Content-Type": "application/json"
                },
                body: resp
            };
        } catch (error) {
            context.res = {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    message: error.toString()
                }
            };
        }
    };
    

    
    switch (req.method) {
        case "POST":
            await createGroupUser()
            break;

        default:
            break;
    }


};

export default httpTrigger

