import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
import { createConnection } from "../shared/mongo";
import { Db } from "mongodb";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const database = createConnection()

// TODO -> Definir como variable de entorno
const openAIModelLimit = 9500

async function creatTitle(
    currentItem: any, db: Db
): Promise<string> {


    const prompt =
        `Write in english a short and accurate title (titleAI) related to the following slide's paragraph:\n` +
        currentItem.paragraph + "\n" +
        "This slide was extracted from a course named: " + currentItem.courseName + ".\n" +
        "If the paragraph is not in english then translate titleAI into the paragraph's language (translatedTitleAI).\n" +
        "If the paragraph is in english both titleAI and translatedTitleAI are the same.\n" +
        "The answer must not exceed 5 words and must be in Json format."

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant",
                },
                {
                    role: "user",
                    content: prompt,
                }
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "title_response",
                    "strict": true,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "titleAI": {
                                "type": "string",
                            },
                            "translatedTitleAI": {
                                "type": "string"
                            }
                        },
                        "required": ["titleAI", "translatedTitleAI"],
                        "additionalProperties": false
                    }
                }
            }
        });



        updateCourseTokens(currentItem.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        const generatedPrompt = response.choices[0].message.content
        const titles = JSON.parse(generatedPrompt)

        let currentTitleAIPath =
            `sections.${currentItem.sectionIndex}.elements.${currentItem.elementIndex}.elementLesson.paragraphs.${currentItem.slideIndex}.titleAI`;

        let currentTranslatedTitleAIPath =
            `sections.${currentItem.sectionIndex}.elements.${currentItem.elementIndex}.elementLesson.paragraphs.${currentItem.slideIndex}.translatedTitleAI`;


        await db.collection("course").findOneAndUpdate(
            { code: currentItem.courseCode },
            {
                $set: {
                    [currentTitleAIPath]: titles.titleAI,
                    [currentTranslatedTitleAIPath]: titles.translatedTitleAI
                },
            }
        );

        try {
            await db.collection("slide").updateOne(
                { _id: currentItem._id },
                {
                    $set: { titleStatus: "created" }
                }
            );


        } catch (error) {

            console.error("Fatal error", error)
        }
        //

        return "ok";
    } catch (error) {
        console.error("Title error", error)
        await saveLog(
            `Error creating titles for course: ${currentItem.courseCode}.`,
            "Error",
            "AsyncTitleCycle()",
            "Courses/{courseCode}/CreateContent"
        );
        return undefined;
    }
}

export async function AsyncTitleCycle() {

    console.info('AsyncTitleCycle function ran at:' + new Date().toISOString());

    const db = await database
    const slide = db.collection("slide")

    const slidesInList = await slide
        .find({ "titleStatus": "waiting" })
        .sort({ "timestamp": 1 })
        .limit(openAIModelLimit)
        .toArray();

    if (slidesInList.length <= 0)
        return

    const idsToUpdate = slidesInList.map(slide => slide._id);

    await slide.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { titleStatus: "processing" } }
    );

    slidesInList.forEach(element => {
        creatTitle(element, db)
    })


}
