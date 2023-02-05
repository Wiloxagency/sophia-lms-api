import { createAudio } from "../shared/createAudios";
import { createConnection } from "../shared/mongo";
import { createParagraphs } from "../shared/createParagrahs"
import { findImages } from "../shared/findImages";
import { paragraphCreation } from "../interfaces/paragraph"
import { saveLog } from "../shared/saveLog";

const database = createConnection()

export async function createContentCycle(course: any) {

    let payload: paragraphCreation
    if (!(course.sections && course.sections.length > 0)) {
        await saveLog("Course has not sections", "Error", "createContentCycle()", "Courses/{courseCode}/CreateContent")
        return
    }

    const startCreation = new Date()
    let totalParagraphCounter = 0
    await saveLog(`Start content creating for course: ${course.code}`, "Info", "createContentCycle()", "Courses/{courseCode}/CreateContent")

    const db = await database
    const Course = db.collection("course")

    try {

        let syllabus = course.sections.map((item: any) => {
            return item.title
        })

        payload = {
            context: course.details.title,
            key: "",
            text: "",
            index: 0,
            maxParagraphs: 10,
            courseStructure: syllabus,
            language: "es",
            courseCode: course.code
        }

        // Create Content
        const contentCycle = async (sectionCounter: number) => {

            payload.text = course.sections[sectionCounter].title
            payload.index = sectionCounter
            const currentParagraphs = await createParagraphs(payload)
            course.sections[currentParagraphs.sectionIndex].elements[0].paragraphs = currentParagraphs.content.map((text: string) => {
                return { content: text }
            })
            sectionCounter++

            // Create Audios & find images
            const multimediaCycle = async (paragraphCounter: number) => {

                const currentAudio = await createAudio(currentParagraphs.content[paragraphCounter], "JorgeNeural", "es", course.code, currentParagraphs.sectionIndex, 0, paragraphCounter)
                console.info(`Audio for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["audioUrl"] = currentAudio.url

                const currentImageData = await findImages(currentParagraphs.content[paragraphCounter], payload.text, course.details.title, "wide", "es", [], course.code)
                console.info(`Image for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["imageData"] = currentImageData

                paragraphCounter++
                totalParagraphCounter++

                if (paragraphCounter == currentParagraphs.content.length) {
                    if (sectionCounter == syllabus.length) {

                        await saveLog(`Finish content creating for course: ${course.code}`, "Info", "createContentCycle()", "Courses/{courseCode}/CreateContent")

                        // Save course (in the future be necessary to check if content was 100% fine generated)

                        await Course.findOneAndUpdate({ code: course.code }, {
                            $set: { sections: course.sections }
                        })
                        const endCreation = new Date()
                        const totalCreationTime = Math.abs(Math.round((startCreation.getTime() - endCreation.getTime()) / 1000 / 60))
                        await saveLog(`Update content for course: ${course.code}. ${course.sections.length} Sections and ${totalParagraphCounter} Slides was created in ${totalCreationTime} minutes.`, "Info", "createContentCycle()", "Courses/{courseCode}/CreateContent")
                    } else {
                        await Course.findOneAndUpdate({ code: course.code }, {
                            $set: { sections: course.sections }
                        })
                        contentCycle(sectionCounter)
                    }

                } else {
                    multimediaCycle(paragraphCounter)
                }
            }
            multimediaCycle(0)
        }
        contentCycle(0)

    } catch (error) {
        await saveLog(`Bad structure found in course: ${course.code}.`, "Error", "createContentCycle()", "Courses/{courseCode}/CreateContent")
        console.error(error)
        return
    }

}
