import parseMultipartFormData from "@anzp/azure-function-multipart";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import OpenAI from "openai";

import fs from 'fs';
import { ParsedFile } from "@anzp/azure-function-multipart/dist/types/parsed-file.type";
import { chatWithDocsAgent, contentTableAgent } from "./prompts";
import { detectLanguage } from "../shared/languages";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a Agent.');

    const chatWithDocuments = async (vectorStoreId: string,
        details: {
            ask: string
        }
    ): Promise<string> => {

        console.info("details.ask: ", details.ask)
        const language = await detectLanguage(details.ask)
        console.info("Detected language: ", language)

        const chatWithDocsPrompt = chatWithDocsAgent.prompt
            .replace(/v{question}/g, details.ask)
            .replace(/v{languageName}/g, language)

        const instructions = chatWithDocsAgent.instructions
            

        console.info("chatWithDocsPrompt:", chatWithDocsPrompt)
        console.info("instructions: ", instructions)

        const assistant = await openai.beta.assistants.create({
            name: "Content Development Expert",
            instructions: instructions,
            model: "gpt-4o",
            tools: [{ type: "file_search" }]
        });

        await openai.beta.assistants.update(assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
        });


        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: "user",
                    content: chatWithDocsPrompt,

                },
            ],
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: assistant.id,
        });


        const messages = await openai.beta.threads.messages.list(thread.id, {
            run_id: run.id,
        });

        const message = messages.data.pop()!;
        if (message.content[0].type === "text") {
            const { text } = message.content[0];
            console.log(text.value);
            const { annotations } = text;
            const citations: string[] = [];

            let index = 0;
            for (let annotation of annotations) {
                text.value = text.value.replace(annotation.text, "[" + index + "]");
                index++;
            }


            console.info("text.value:", text.value);
            return text.value
        }


        return ""
    }

    const ceateContentTable = async (vectorStoreId: string,
        details: {
            languageName: string,
            maxSections: number,
            courseName: string,
            courseDescription: string,
        }
    ): Promise<string[]> => {

        const contentTablePrompt = contentTableAgent.prompt
            .replace("v{languageName}", details.languageName)
            .replace(/v{maxSections}/g, details.maxSections.toString())
            .replace("v{courseName}", details.courseName)
            .replace("v{courseDescription}", details.courseDescription)

        const instructions = contentTableAgent.instructions.replace("v{courseName}", details.courseName)

        console.info("contentTablePrompt:", contentTablePrompt)
        console.info("instructions: ", instructions)

        const assistant = await openai.beta.assistants.create({
            name: "Content Development Expert",
            instructions: instructions,
            model: "gpt-4o",
            tools: [{ type: "file_search" }]
        });

        await openai.beta.assistants.update(assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
        });


        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: "user",
                    content: contentTablePrompt,

                },
            ],
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: assistant.id,
        });


        const messages = await openai.beta.threads.messages.list(thread.id, {
            run_id: run.id,
        });

        const message = messages.data.pop()!;
        if (message.content[0].type === "text") {
            const { text } = message.content[0];
            console.log(text.value);
            const { annotations } = text;
            const citations: string[] = [];

            let index = 0;
            for (let annotation of annotations) {
                text.value = text.value.replace(annotation.text, "[" + index + "]");
                index++;
            }


            let splittedcontentTable = text.value
                .trim()
                .replace(/\d{1,2}\./g, "")
                .split("\n")
                .map((item) => {
                    return item.trim();
                })
                .filter((item) => {
                    return item.length > 1;
                });

            console.info("splittedcontentTable:", splittedcontentTable);
            return splittedcontentTable
        }

        return null
    }

    

    const ceateVectorStore = async (req: HttpRequest): Promise<string> => {

        const { fields, files } = await parseMultipartFormData(req);

        console.info("fields: ", fields)
        let response = "None"

        if (!files || !Array.isArray(files)) {
            response = 'No files uploaded.';
        } else {
            response = "No. Files= " + files.length
        }

        const vectorStoreName = fields.filter(field => {
            return field.name == 'vectorStoreName'
        })[0].value

        try {
            const fileStreams = files.map((file: ParsedFile) => {
                const filePath = `/tmp/${file.filename}`;

                // Guardamos el archivo temporalmente
                fs.writeFileSync(filePath, Buffer.from(file.bufferFile));

                // Creamos un stream de lectura
                return fs.createReadStream(filePath);
            });



            // Crear un vector store incluyendo nuestros archivos
            let vectorStore = await openai.beta.vectorStores.create({
                name: vectorStoreName,
            });

            if (!vectorStore || !vectorStore.id) {
                throw new Error('Error al crear el vector store');
            }

            console.info(vectorStore)

            await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: fileStreams })

            return vectorStore.id

        } catch (error) {
            console.error('Error:', error);
            return "error"
        }

    }

    console.info("params: ", req.body)

    const savedVectorStoreId = req.query.vectorStoreId

    switch (req.method) {

        case "POST":

            if (savedVectorStoreId) {

                switch (req.query.task) {

                    case "createContentTable":
                        const details = {
                            languageName: req.body.languageName,
                            maxSections: parseInt(req.body.maxSections),
                            courseName: req.body.courseName,
                            courseDescription: req.body.courseDescription,
                        }
                        console.info("details: ", details)

                        const contentTable = await ceateContentTable(savedVectorStoreId, details)

                        context.res = {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                            body: { "contentTable": contentTable }
                        };

                        break;

                    case "chatWithDocs":
                        const chatDetails = {
                            ask: req.body.ask
                        }
                        console.info("chatDetails: ", chatDetails)

                        const answer = await chatWithDocuments(savedVectorStoreId, chatDetails)

                        context.res = {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                            body: { "answer": answer }
                        };

                        break;
                        

                    default:
                        context.res = {
                            status: 400,
                            headers: { "Content-Type": "application/json" },
                            body: { "error": "Missing a valid task parameter." }
                        };
                        break;
                }



            } else {
                // Create a Vector Store with documents
                const vectorStoreId = await ceateVectorStore(req);
                context.res = {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    body: { "vectorStoreId": vectorStoreId }
                };
            }
            break;



        default:
            break;
    }

};



export default httpTrigger;