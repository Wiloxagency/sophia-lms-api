import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()


 const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createWebhook = async () => {


        try {
            console.info("Receiving webhook")
            const db = await database
            const Webhooks = db.collection('webhook')
            const resp = Webhooks.insertOne(req.body)

            const body = await resp

            if (body) {

                context.res.status(200).end() // Responding is important

                // context.res = {
                //     "status": 201,
                //     "headers": {
                //         "Content-Type": "application/json"
                //     },
                //     "body": body
                // }
            } else {
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating course"
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

