import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    
    const getLogs = async (type: string, search: string, data: string, skip: string, items_by_page: string) => {

        try {

            const db = await createConnection()
            const collection = db.collection("log")

            const regex = new RegExp(search, "i") // "i" indica que a busca é case-insensitive

            const query  = { $or: [
                { 'message': { $regex: regex } },
                { 'endpoint': { $regex: regex } },
                { 'functionName': { $regex: regex } },
                { 'timestamp': { $regex: regex } }
            ]}
            
            const regexData = new RegExp(data, "i") 

            const queryData = { 'timestamp': { $regex: regexData } }

            const skipNum = parseInt(skip)

            const limitNum = parseInt(items_by_page)

            const body = await collection.find(Object.assign({ 'logType': type }, queryData, query)).skip(skipNum).limit(limitNum).toArray();

            console.log(body)


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
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "No logs found"
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
                    "message": "Error getting logs"
                }
            }

        }
    }

    switch (req.method) {
        case "GET":
          await getLogs(
            req.query.type, 
            req.query.search, 
            req.query.data, 
            req.query.skip, 
            req.query.items_by_page)
          break;
      
        default:
          break;
      }
      


};

export default httpTrigger
