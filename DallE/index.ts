import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const { Configuration, OpenAIApi } = require("openai")
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)
    try {
        const response = await openai.createImage({
            prompt: req.body.prompt,
            // prompt: "a white siamese cat",
            n: 4,
            size: "1024x1024",
        })

        context.res = {
            "status": 201,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": { "response": response.data.data }
        }

    } catch (error) {

        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error creating image"
            }
        }
    }
}

export default httpTrigger