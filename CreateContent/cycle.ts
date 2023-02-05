import { createAudio } from "../shared/createAudios";
import { createConnection } from "../shared/mongo";
import { createParagraphs } from "../shared/createParagrahs"
import { findImages } from "../shared/findImages";
import { paragraphCreation } from "../interfaces/paragraph"

const database = createConnection()

export async function createContentCycle(course: any) {

    let payload: paragraphCreation
    if (!(course.sections && course.sections.length > 0)) {
        console.error("Course has not sections")
        return
    }

    const startCreation = new Date()
    let totalParagraphCounter = 0

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
            language: "es"
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

                const currentAudio = await createAudio(currentParagraphs.content[paragraphCounter], "JorgeNeural", "es", currentParagraphs.sectionIndex, 0, paragraphCounter)
                console.info(`Audio for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["audioUrl"] = currentAudio.url

                const currentImageData = await findImages(currentParagraphs.content[paragraphCounter], payload.text, course.details.title, "wide", "es", [])
                console.info(`Image for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["imageData"] = currentImageData

                paragraphCounter++
                totalParagraphCounter++

                if (paragraphCounter == currentParagraphs.content.length) {
                    if (sectionCounter == syllabus.length) {
                        console.info("Course Finished ")
                        console.info(course)
                        // Save course (in the future be necessary to check if content was 100% fine generated)

                        await Course.findOneAndUpdate({ code: course.code }, {
                            $set: { sections: course.sections }
                        })
                        console.info("Course Saved ")
                        const endCreation = new Date()
                        const totalCreationTime = Math.abs(Math.round((startCreation.getTime() - endCreation.getTime()) / 1000 / 60))
                        console.info(`Course of ${course.sections.length} Sections and ${totalParagraphCounter} Slides was created in ${totalCreationTime} minutes.`)
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
        console.error("Bad structure in current course")
        console.error(error)
        return
    }

}
