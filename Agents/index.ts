import parseMultipartFormData from "@anzp/azure-function-multipart";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import OpenAI from "openai";
import { Uploadable } from "openai/uploads";
import fs from 'fs';
import { ParsedFile } from "@anzp/azure-function-multipart/dist/types/parsed-file.type";
import { contentTableAgent } from "./prompts";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a Agent.');



    // Convertir los archivos a un array de Uploadable

    // let path = new URL("https://sophieassets.blob.core.windows.net/documents/015b9763-8ff1-4bee-955b-c047aa5e8673.pdf");
    // const fileArray = files.map(file => {
    //     fs.createReadStream(path)
    // }) as unknown as Uploadable[];

    // const fileStreams = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"].map((path) =>
    //     fs.createReadStream(path),
    //   );

    // console.info("fileArray: ", fileStreams)


    // const assistant = await openai.beta.assistants.create({
    //     name: "Financial Analyst Assistant",
    //     instructions: "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
    //     model: "gpt-4o",
    //     tools: [{ type: "file_search" }],
    // });



    // Reading Vector Sotarge - Working Fine

    /*
    await openai.beta.assistants.update(assistant.id, {
        tool_resources: { file_search: { vector_store_ids: ["vs_6ivzebHR44kh8pbAnH6B4kl6"] } },
      });


    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: "user",
                content:
                    "¿El Data Explorer está en la capacidad de proveer qué?",

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
        const { annotations } = text;
        const citations: string[] = [];

        let index = 0;
        for (let annotation of annotations) {
            text.value = text.value.replace(annotation.text, "[" + index + "]");
            // const { file_citation } = annotation;
            // if (file_citation) {
            //     const citedFile = await openai.files.retrieve(file_citation.file_id);
            //     citations.push("[" + index + "]" + citedFile.filename);
            // }
            index++;
        }

        console.log(text.value);
        console.log(citations.join("\n"));
    }
    */

    // End of Reading Vector Store


    const ceateCourse = async (vectorStoreId: string,
        details: {
            languageName: string,
            maxSections: number,
            courseName: string,
            courseDescription: string,
        }
    ): Promise<string> => {

        const contentTablePrompt = contentTableAgent.prompt 
            .replace("v{languageName}", details.languageName)
            .replace(/v{maxSections}/g , details.maxSections.toString())
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
            const { annotations } = text;
            const citations: string[] = [];
    
            let index = 0;
            for (let annotation of annotations) {
                text.value = text.value.replace(annotation.text, "[" + index + "]");
                // const { file_citation } = annotation;
                // if (file_citation) {
                //     const citedFile = await openai.files.retrieve(file_citation.file_id);
                //     citations.push("[" + index + "]" + citedFile.filename);
                // }
                index++;
            }
    
            console.log(text.value);
            console.log(citations.join("\n"));
            return text.value
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

            await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: fileStreams })

            return vectorStore.id

        } catch (error) {
            console.error('Error:', error);
            return "error"
        }

    }

    switch (req.method) {

        case "POST":

            if (req.query.vectorStoreId) {

                console.info("params: ", req.body)
                const details = { 
                    languageName: req.body.languageName,
                    maxSections: parseInt(req.body.maxSections), 
                    courseName: req.body.courseName,
                    courseDescription: req.body.courseDescription,
                }
                console.info("details: ", details)

                const contentTable = await ceateCourse(req.query.vectorStoreId, details)

                context.res = {
                    status: 200,
                    body: { "contentTable": contentTable }
                };

            } else {
                // Create a Vector Store with documents
                const vectorStoreId = await ceateVectorStore(req);
                context.res = {
                    status: 200,
                    body: { "vectorStoreId": vectorStoreId }
                };
            }
            break;



        default:
            break;
    }

};



export default httpTrigger;