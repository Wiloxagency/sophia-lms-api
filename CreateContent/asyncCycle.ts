import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { asyncCreateParagraphs } from "./asyncCreateParagrahs";
import { asyncCreateParagraphsWithAgent } from "./asyncCreateParagraphsWithAgent";
import { findPexelsAssets } from "./pexels";
import { findVecteezyAssets } from "./vecteezy";

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

    if (!(course.type && course.type == "resume")) {

        await Courses.findOneAndUpdate(
            { code: course.code },
            {
                $set: {
                    sections: course.sections,
                    language: course.language,
                    languageName: course.languageName,
                    voice: course.voice,
                    generationType: course.generationType,
                    vectorStoreId: course.vectorStoreId ? course.vectorStoreId : ""
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
    console.info(course)

    if (course.slideshowGlobalAssetsSource == "vecteezy") {
        findVecteezyAssets(course.details.title, course.code, courseStructure, db)
    } else if (course.slideshowGlobalAssetsSource == "pexels") {
        findPexelsAssets(course.details.title, course.code, courseStructure, db)
    }

    course.sections.forEach((sectionItem: any, sectionIndex: number) => {
        sectionItem.elements.forEach((lessonItem: any, lessonIndex: number) => {
            if (course.generationType == "generatedByDocuments") {
                asyncCreateParagraphsWithAgent(
                    course.vectorStoreId,
                    course.code,
                    course.details.title,
                    courseStructure,
                    course.languageName,
                    course.language,
                    course.voice,
                    course.slideshowGlobalAssetsSource,
                    sectionItem.title,
                    sectionIndex,
                    lessonIndex
                )
            } else {
                asyncCreateParagraphs(
                    course.code,
                    course.details.title,
                    courseStructure,
                    course.languageName,
                    course.language,
                    course.voice,
                    course.slideshowGlobalAssetsSource,
                    sectionItem.title,
                    sectionIndex,
                    lessonIndex
                )
            }

        });
    });


}
