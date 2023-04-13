import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()


 const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createWebhook = async () => {


        try {
            console.info("Receiving webhook")

            console.info("req.body", req.body)

            

            const decodedString = decodeURIComponent(req.body);

            console.info("decodedString", decodedString)

            const urlParams = new URLSearchParams(decodedString);
            const webhookData = {
                nombre: urlParams.get('fields[name][value]'),
                apellido: "",
                email: urlParams.get('fields[field_303f79d][value]'),
                telefono: urlParams.get('fields[field_63194d0][value]'),
                empresa: urlParams.get('fields[field_84ccca9][value]'),
                cargo: urlParams.get('fields[message][value]'),
            }

            console.info("webhookData", webhookData)
            const db = await database
            const Webhooks = db.collection('webhook')
            const resp = Webhooks.insertOne(webhookData)
            const body = await resp

            if (body) {
                await saveLog(`Webhook data saved for user: ${webhookData.email}`, "Info", "createWebhook()", "Webhook")
                //context.res.status(200).end() // Responding is important


                context.res = {
                    "status": 200
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

