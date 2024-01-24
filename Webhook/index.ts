import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { sendScormUnderConstructionEmail } from "../nodemailer/scormDownloadEmail";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createWebhook = async () => {

        try {
            // console.info("Receiving webhook")
            // console.info("req.body", req)
           
            // console.info("decodedString", decodedString)
            // console.log(req.headers['x-microsoftspeechservices-event'])

            const decodedString = decodeURIComponent(req.body);
            const urlParams = new URLSearchParams(decodedString);
            const webhookData = {
                nombre: urlParams.get('Nombre'),
                apellido: urlParams.get('Apellido'),
                email: urlParams.get('Email'),
                telefono: urlParams.get('Teléfono'),
                empresa: urlParams.get('Empresa'),
                cargo: urlParams.get('Cargo'),
                date: urlParams.get('Date'),
                Time: urlParams.get('Time'),
                origin: "Webhook"
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