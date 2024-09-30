import { paragraphCreation } from "../interfaces/paragraph";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { asyncTextToSpeech } from "./asyncCreateAudios";
import { asyncCreateParagraphs } from "./asyncCreateParagrahs";

const database = createConnection();

export async function asyncCreateContent(
    course: any,
) {

    if (!(course.sections && course.sections.length > 0)) {
        await saveLog(
            `Course: ${course.code} has not sections`,
            "Error",
            "createContentCycle()",
            "Courses/{courseCode}/CreateContent"
        );
        return;
    }

    const db = await database;
    const Courses = db.collection("course");
    const startCreation = new Date();

    if (!(course.type && course.type == "resume")) {
        await Courses.findOneAndUpdate(
            { code: course.code },
            {
                $set: {
                    sections: course.sections,
                    language: course.language,
                    languageName: course.languageName,
                    voice: course.voice,
                },
            }
        );
        await saveLog(
            `Start content creating for course: ${course.code}`,
            "Info",
            "asyncCreateContent()",
            "Courses/{courseCode}/CreateContent"
        );
    }

    let courseStructure = course.sections.map((item: any) => {
        return item.title;
    });

    console.info(courseStructure)

    course.sections.forEach((sectionItem: any, sectionIndex: number) => {
        sectionItem.elements.forEach((lessonItem: any, lessonIndex: number) => {
            asyncCreateParagraphs(
                course.code,
                course.details.title,
                courseStructure,
                course.languageName,
                course.language,
                sectionItem.title,
                sectionIndex,
                lessonIndex
            )
        });
    });

    asyncTextToSpeech()
}
