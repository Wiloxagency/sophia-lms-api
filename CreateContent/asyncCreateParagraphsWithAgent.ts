
import { contentParagraphsAgent, contentParagraphsAgentOld } from "./prompts";
import { paragraphCreation } from "../interfaces/paragraph";
import OpenAI from "openai";
import { cleanText, splitParagraphs } from "./asyncCreateParagrahs";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const database = createConnection()

export async function asyncCreateParagraphsWithAgent(
    vectorStoreId: string,
    courseCode: string,
    courseName: string,
    courseStructure: string[],
    languageName: string,
    languageIso: string,
    voice: string,
    assetsSource: string,
    sectionTitle: string,
    sectionIndex: number,
    elementIndex: number,
) {

    const contentParagraphsPrompt = contentParagraphsAgentOld.prompt
        .replace(/v{languageName}/g, languageName)
        .replace(/v{courseName}/g, courseName)
        .replace(/v{sectionName/g, sectionTitle)
        .replace("v{contentTable}", courseStructure.join("\n"))

    const instructions = contentParagraphsAgent.instructions //.replace("v{courseName}", paragraphsDetails.context)

    console.info("contentParagraphsPrompt:", contentParagraphsPrompt)
    console.info("instructions: ", instructions)
    try {
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
                {
                    role: "assistant",
                    content: "The content for this slide is:",

                }
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

            const formattedData =
                text.value.charAt(0).toUpperCase() + text.value.slice(1);

            // const splitParagraphs = splitParagraphs(formattedData, true);
            const paragraphs = splitParagraphs(formattedData, true)
                .map((item) => {
                    return item.trim();
                })
                .filter((item) => {
                    return item.length > 1;
                });


            const cleanParagraphs = paragraphs.map((paragraph) => {
                return cleanText(paragraph);
            });

            let date = new Date()

            let payloads = []
            let courseParagraphs = []
            cleanParagraphs.forEach((paragraph: string, slideIndex: number) => {
                let payload = {
                    timestamp: date,
                    courseName: courseName,
                    courseCode: courseCode,
                    sectionIndex: sectionIndex,
                    elementIndex: elementIndex,
                    slideIndex: slideIndex,
                    paragraph: paragraph,
                    language: languageIso,
                    voice: voice,
                    assetsSource: assetsSource,
                    ttsStatus: "waiting",
                    titleStatus: "waiting",
                }

                switch (assetsSource) {

                    case 'openai':
                      payload['promptStatus'] = "waiting";
                      payload['dalleStatus'] = "waiting-prompt";
                      payload['prompts'] = [];
                      break;
            
                    case 'vecteezy':
                      payload['assetStatus'] = "waiting";
                      break;
            
                    default:
                      break;
                  }

                let courseParagraph = {

                    "content": paragraph,
                    "audioScript": paragraph,
                    "imageData": {
                        "finalImage": {
                            "url": null,
                            "width": 0,
                            "height": 0
                        },
                    },
                    "videoData": {
                        "thumb": {
                            "url": "",
                            "width": 0,
                            "height": 0
                        },
                        "finalVideo": {
                            "url": "",
                            "width": 0,
                            "height": 0
                        }
                    }
                }
                payloads.push(payload)
                courseParagraphs.push(courseParagraph)
            })

            const db = await database

            let paragraphsArrayPath =
                `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs`;

            if (payloads.length > 0) {
                const slide = db.collection("slide")
                await slide.insertMany(payloads)
            } else {
                paragraphsArrayPath =
                    `sections.${sectionIndex}.elements`;
                courseParagraphs = []
            }




            await db.collection("course").findOneAndUpdate(
                { code: courseCode },
                {
                    $set: {
                        [paragraphsArrayPath]: courseParagraphs
                    },
                }
            );

        }
    } catch (error) {
        await saveLog(
            `Error: ${error.message} creating Paragraph for course: ${courseCode}.`,
            "Error",
            "asyncCreateParagraphsWithAgent()",
            "Courses/{courseCode}/CreateContent"
        );
        console.error(error);

    }
}