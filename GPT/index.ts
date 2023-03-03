import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Configuration, OpenAIApi } from 'openai'

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: 'You are a helpful assistant.'
                },
                {
                    role: "user",
                    content: req.body.prompt
                }
            ]
        })
        // console.log(response.data.choices[0].message.content)
        context.res = {
            "status": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": response.data.choices[0].message.content
        }
    } catch (error) {
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error"
            }
        }
    }

}

export default httpTrigger