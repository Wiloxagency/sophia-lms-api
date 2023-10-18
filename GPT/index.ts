import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Configuration, OpenAIApi } from 'openai'
import { saveLog } from "../shared/saveLog"

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    async function chatCompletion() {
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
            await saveLog(`Error creating Chat Completion, error: ${error.message} `, "Error", "AzureFunction()", "GPT")
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

    async function CreateCourseSummary() {
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
                        content: 'You will be given a text delimited by triple quotes.'
                    },
                    {
                        role: "user",
                        content: 'Text:"""' + req.body.courseTitle + '"""'
                    },
                    {
                        role: "user",
                        content: 'Create a short description for a course teaching the content of the text. The descrition should be in Spanish.'
                    },
                    {
                        role: "assistant",
                        content: 'Descripción del curso: '
                    }
                ]
            })
            // console.log(response.data.choices[0].message.content)
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { response: response.data.choices[0].message.content }
            }
        } catch (error) {
            await saveLog(`Error creating course description, error: ${error.message} `, "Error", "AzureFunction()", "GPT")
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




    if (req.query.createCourseSummary) {
        await CreateCourseSummary()
    } else {
        await chatCompletion()
    }

}

export default httpTrigger