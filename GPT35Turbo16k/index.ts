import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";
import { saveLog } from "../shared/saveLog";
import { createConnection } from "../shared/mongo";

const AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let messagesPipeline: {
    role: 'system' | 'assistant' | 'user',
    content: string
}[] =
    [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: "You will be provided with background information delimited by triple quotes." },
    ]

let selectedFileContent = ''

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    const chatSession = async () => {
        // console.log(selectedFileContent)
        // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        // console.log(req.body.selectedFileContent)
        try {
            if (
                selectedFileContent == '' ||
                selectedFileContent != req.body.selectedFileContent
            ) {
                console.log('CONTENT IS DIFFERENT. REINITIALIZING MESSAGE PIPELINE')
                selectedFileContent = req.body.selectedFileContent
                messagesPipeline.splice(2)
                messagesPipeline.push({ role: "user", content: `"""${selectedFileContent}""""` })
                messagesPipeline.push({ role: "user", content: `Based on the information provided within the content reply to the prompts, if the answer is not incluided in the content, indicate it with a message. You can only reply in spanish.` })
                // console.log(messagesPipeline)
            } else {

                // const db = await database;
                // const Embedding = db.collection("embedding");

                // const resp = await Embedding.findOne({ 'code': req.params.code })

                // const prompt = req.body.prefix +
                //     " \n###\n" +
                //     resp.content +
                //     "\n###\n" +
                //     req.body.suffix +
                //     "\n###\n" +
                //     req.body.question +
                //     " \n###\n"

                // console.info(prompt)
                // messagesPipeline.push({ role: "user", content: prompt },)
            }
            messagesPipeline.push(req.body.message)
            // console.log(messagesPipeline)

            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo-16k",
                messages: messagesPipeline,
            });

            const extractedValue = response.data.choices[0].message.content;

            context.res = {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: { resp: extractedValue }

            };
        } catch (error) {
            await saveLog(
                `Error creating Chat Completion: ${error.message}`,
                "Error",
                "AzureFunction()",
                "AnswerTheQuestion"
            );
            context.res = {
                status: 500,
                headers: { "Content-Type": "application/json" },
                body: { message: "Error" },
            };
        }
    }

    async function summarizeContent() {
        try {
            const prompt = await openai.createChatCompletion({
                model: "gpt-3.5-turbo-16k",
                messages: [
                    { role: "system", content: "You are a helpful assistant" },
                    { role: "user", content: "You will be provided with background information delimited by triple quotes." },
                    { role: "user", content: `"""${req.body.selectedFileContent}"""` },
                    { role: "user", content: "Create a summary in Spanish of exactly 5 paragraphs of the given content." },
                    { role: "user", content: "The output format will be used into an api endpoint, must be an array of 5 strings in javascript, where each element corresponds to each of the generated paragraphs. Example: [ paragraph 1, paragraph 2, ... paragraph 5 ]" },
                ]
            });

            const promptResponse = prompt.data.choices[0].message.content

            context.res = {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: { resp: promptResponse }
            };
        } catch (error) {
            await saveLog(
                `Error creating Chat Completion: ${error.message}`,
                "Error",
                "AzureFunction()",
                "AnswerTheQuestion"
            );
            context.res = {
                status: 500,
                headers: { "Content-Type": "application/json" },
                body: { message: "Error" },
            };
        }
    }

    if (req.body.action == 'chatSession') {
        await chatSession()
    } else if (req.body.action == 'summarizeContent') {
        await summarizeContent()
    }

};

export default httpTrigger;
