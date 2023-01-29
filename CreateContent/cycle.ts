import { createParagraphs } from "../shared/createParagrahs";
import { paragraphCreation } from "../interfaces/paragraph";


export async function createContentCycle(course: any) {

    let payload: paragraphCreation
    let sectionNumber: number = 0
    if (!(course.sections && course.sections.length > 0)) {
        console.error("Course has not sections")
        return
    }

    try {

        let syllabus = course.sections.map((item: any) => {
            return item.title
        })

        syllabus.forEach(async (title: string, sectionIndex: number) => {

            payload = {
                context: course.details.title,
                key: "",
                text: title,
                index: sectionIndex,
                maxParagraphs: 10,
                courseStructure: syllabus,
                language: "es"
            }

            console.info("payload -->", payload)
            const currentParagraphs = await createParagraphs(payload)
            console.info("Title -->", syllabus[currentParagraphs.index])
            console.info("currentParagraphs -->", currentParagraphs)

        });


    } catch (error) {
        console.error("Bad structure in current course");
        console.error(error);
        return
    }






}
