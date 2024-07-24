
import { contentParagraphsAgent  } from "./prompts";
import { paragraphCreation } from "../interfaces/paragraph";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function createParagraphsWithAgent(vectorStoreId: string,
    paragraphsDetails: paragraphCreation
): Promise<{ content: string[]; sectionIndex: number }> {

    let context = paragraphsDetails.context
    const courseName = paragraphsDetails.context
    const sectionName: string = paragraphsDetails.text

    const contentParagraphsPrompt = contentParagraphsAgent.prompt
        .replace("v{languageName}", paragraphsDetails.languageName)
        .replace(/v{courseName}/g, courseName)
        .replace("v{sectionName}", sectionName  )
        .replace("v{contentTable}", paragraphsDetails.courseStructure.join("\n") )

    const instructions = contentParagraphsAgent.instructions.replace("v{courseName}", paragraphsDetails.context)

    console.info("contentParagraphsPrompt:", contentParagraphsPrompt)
    console.info("instructions: ", instructions)

    const assistant = await openai.beta.assistants.create({
        name: "Content Development Expert",
        instructions: instructions,
        model: "gpt-4o",
        tools: [{ type: "file_search" }]
    });

    console.info("assistant: ", assistant)
    console.info("vector_store_ids: ", vectorStoreId)

    await openai.beta.assistants.update(assistant.id, {
        tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
    });


    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: "user",
                content: contentParagraphsPrompt,

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


        let splittedParagraphs = text.value
            .trim()
            .replace(/\d{1,2}\./g, "")
            .replace(/\[\d+\]/g, '')
            .split(".\n")
            .map((item) => {
                return item.trim();
            })
            .filter((item) => {
                return item.length > 1;
            });

        console.info("splittedParagraphs:", splittedParagraphs);
        return { content: splittedParagraphs, sectionIndex: paragraphsDetails.index };

    }

    return { content: null, sectionIndex: paragraphsDetails.index };
}