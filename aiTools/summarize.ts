import OpenAI from "openai";
import { topicsAgent } from "./prompts";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function main(vectorStoreId: string, conciseness: number, language: string): Promise<string> {

    const vectorStore = await openai.beta.vectorStores.retrieve(vectorStoreId);
    console.log(vectorStore)

    if (!vectorStore || !vectorStore.id) {
        throw new Error('Error al crear el vector store');
    }

    console.info(vectorStore)

    let numberOfSections = (vectorStore.usage_bytes / 2850) * (conciseness * 5 / 100)

    numberOfSections = numberOfSections > 20 ? 20 : numberOfSections
    numberOfSections = numberOfSections < 2 ? 2 : numberOfSections

    numberOfSections = Math.round(numberOfSections)

    console.info(numberOfSections)

    let topicsPrompt = topicsAgent.prompt
        .replace(/v{maxSections}/g, numberOfSections.toString())
        .replace(/v{languageName}/g, language)

    const instructions = topicsAgent.instructions

    console.info("topicsPrompt:", topicsPrompt)
    console.info("instructions: ", instructions)

    const assistant = await openai.beta.assistants.create({
        name: "Academic Professor Expert",
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
                content: topicsPrompt,

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

        // Create summary

        const assistant2 = await openai.beta.assistants.create({
            name: "Academic Professor Expert",
            instructions: instructions,
            model: "gpt-4o",
            tools: [{ type: "file_search" }]
        });
    
        await openai.beta.assistants.update(assistant2.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
        });
    
        const thread2 = await openai.beta.threads.create({
            messages: [
                {
                    role: "user",
                    content: "Extract in spanish an extensive as possible content about each one of the following items: " + text.value,
    
                },
            ],
        });
    
        const run = await openai.beta.threads.runs.createAndPoll(thread2.id, {
            assistant_id: assistant2.id,
        });
    
    
        const messages = await openai.beta.threads.messages.list(thread2.id, {
            run_id: run.id,
        });
    
        const message2 = messages.data.pop()!;
        if (message2.content[0].type === "text") {
            const { text } = message2.content[0];
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
        
    }

    return ""

}