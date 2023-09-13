import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog"
import { createConnection } from "../shared/mongo"
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const db = await database

    const GetEmbeddings = async () => {
        try {
            const Embeddings = db.collection('embedding')
            const allEmbeddings = await Embeddings.find({}).toArray()
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": allEmbeddings
            }
        } catch (error) {
            await saveLog(`Error getting files, error: ${error.message} `, "Error", "GetEmbeddings()", "embeddings")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error uploading file"
                }
            }
        }
    }

    switch (req.method) {
        case "GET":
            await GetEmbeddings()
            break;

        default:
            break;
    }

}

export default httpTrigger;