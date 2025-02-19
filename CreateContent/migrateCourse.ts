import { Db } from "mongodb";
import { createConnection } from "../shared/mongo"
import { saveLog } from "../shared/saveLog";
import { transformSlides } from "./asyncCreateSlides";
import { findBestTemplateMatch } from "./findBestTemplateMatch";
import { Payload } from "./interfaces";
import { findPexelsAssets } from "./pexels";
import { slideMigration } from "./prompts"
import OpenAI from "openai";
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const database = createConnection()

const migrationCycle = async (
    course: any,
    sectionIndex: number,
    elementIndex: number,
    newCourseCode: string,
    assetsSource: string,
    db: Db): Promise<boolean> => {

    const languageIso = course.language
    const voice = course.voice

    const slides = course.sections[sectionIndex].elements[elementIndex].elementLesson.paragraphs.map((paragraph: any) => {
        return { title: paragraph.translatedTitleAI, text: paragraph.content }
    })

    const presentationName = course.sections[sectionIndex].title
    const courseName = course.details.title
    let prompt = slideMigration.prompt;

    prompt = prompt
        .replace(/v{presentationName}/g, presentationName)
        .replace(/v{courseName}/g, courseName)
        .replace(/v{presentationContent}/g, JSON.stringify(slides))

    console.info(prompt)

    try {

        const response = await openai.beta.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": slideMigration.role
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                },
                {
                    "role": "assistant",
                    "refusal": "I'm sorry, I can't assist with that request."
                }
            ],
            response_format: {
                "type": "json_schema",
                "json_schema": {
                    "name": "presentation",
                    "strict": true,
                    "schema": {


                        "type": "object",
                        "properties": {
                            "slides": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {
                                            "type": "string"
                                        },
                                        "text": {
                                            "type": "string"
                                        },
                                        "sections": {

                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "subtitle": {
                                                        "type": "string"
                                                    },
                                                    "text": {
                                                        "type": "string"
                                                    }
                                                },
                                                "additionalProperties": false,
                                                "required": ["subtitle", "text"]
                                            }


                                        }
                                    },
                                    "additionalProperties": false,
                                    "required": ["title", "text", "sections"]
                                }
                            }
                        },
                        "additionalProperties": false,
                        "required": ["slides"]
                    }
                }
            }
        });



        const slidesData: any = response.choices[0].message.parsed || []

        let date = new Date()

        let slidesArrayPath =
            `sections.${sectionIndex}.elements.${elementIndex}.elementLesson`;

        const formattedSlidesData = transformSlides(slidesData)
        let payloads = []
        formattedSlidesData.slides.forEach((element, slideIndex) => {
            const templateElement = findBestTemplateMatch(element.slideContent, "glass")
            element.slideTemplate = templateElement[0].code

            let payload: Payload = {
                timestamp: date,
                courseName: courseName,
                courseCode: newCourseCode,
                sectionIndex: sectionIndex,
                elementIndex: elementIndex,
                slideIndex: slideIndex,
                paragraph: element.audioScript,
                language: languageIso,
                voice: voice,
                assets: templateElement[0].elements.media,
                ttsStatus: "waiting",
                titleStatus: "waiting",
            }

            switch (assetsSource) {

                case 'openai':

                    payload = {
                        ...payload,
                        promptStatus: "waiting",
                        dalleStatus: "waiting-prompt",
                        prompts: []
                    };

                    break;


                case 'pexels':

                    payload = {
                        ...payload,
                        pexelsStatus: "waiting",

                    };

                default:
                    break;
            }
            payloads.push(payload)

        });

        const slide = db.collection("slide")
        await slide.insertMany(payloads)

        console.info("slidesArrayPath: ", slidesArrayPath, "formattedSlidesData:", formattedSlidesData)
        await db.collection("course").findOneAndUpdate(
            { code: newCourseCode },
            {
                $set: {
                    [slidesArrayPath]: formattedSlidesData
                },
            }
        );


        return true

    } catch (error) {
        await saveLog(
            `Error: ${error.message} creating Slides in migration course: ${course.originalCode} to course ${newCourseCode}`,
            "Error",
            "migrateCourse()",
            "v2/ourses/{courseCode}/migrateCourse"
        );
        console.error(error);
        return false

    }
}

export async function migrateCourse(courseCode: string): Promise<string> {

    const db = await database
    const courses = db.collection("course")
    let course = await courses.findOne({ code: courseCode })
    course.isNewSlideStructure = true;
    const newCourseCode = uuidv4()
    course.code = newCourseCode
    course.originalCode = courseCode
    delete course._id
    await courses.insertOne(course)
    console.info(course.code)

    const courseStructure = course.sections.map((section: any) => {
        return section.title
    })

    const assetsSource = course.slideshowGlobalAssetsSource == "openai" ? "openai" : "pexels"

    if (assetsSource == "pexels") {
        findPexelsAssets(course.details.title, course.code, courseStructure, db)
    }

    for (let sectionIndex = 0; sectionIndex < course.sections.length; sectionIndex++) {
        const elements = course.sections[sectionIndex].elements;

        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            const element = elements[elementIndex];
            if (element.type == "Lección Engine") {
                await migrationCycle(course, sectionIndex, elementIndex, newCourseCode, assetsSource, db)
            }
            
        }
        
    }

    return newCourseCode

}