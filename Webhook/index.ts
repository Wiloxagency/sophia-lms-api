import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()


 const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createWebhook = async () => {


        try {

            const db = await database
            const Webhooks = db.collection('webhook')
            const resp = Webhooks.insertOne(req.body)

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
                await saveLog(`Error getting webhook`, "Error", "createWebhook()", "Webhook")

                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error getting webhook"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error getting webhook, error ${error.message} `, "Error", "createWebhook()", "Webhook")

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

    

    switch (req.method) {
        case "POST":
            await createWebhook()
            break;

        default:
            break;
    }


}

export default httpTrigger;

