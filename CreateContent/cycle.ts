import { createAudio } from "./createAudios";
import { createConnection } from "../shared/mongo";
import { createParagraphs } from "./createParagrahs"
import { findImages } from "./findImages";
import { paragraphCreation } from "../interfaces/paragraph"
import { saveLog } from "../shared/saveLog";
import { extractTitle } from "./titleExtraction";
import { createkeyphrases } from "./createKeyphrases";

const database = createConnection()

export async function createContentCycle(course: any) {

    let payload: paragraphCreation
    if (!(course.sections && course.sections.length > 0)) {
        await saveLog("Course has not sections", "Error", "createContentCycle()", "Courses/{courseCode}/CreateContent")
        return
    }

    const db = await database
    const Course = db.collection("course")

    await Course.findOneAndUpdate({ code: course.code }, {
        $set: { sections: course.sections }
    })

    const startCreation = new Date()
    let totalParagraphCounter = 0
    await saveLog(`Start content creating for course: ${course.code}`, "Info", "createContentCycle()", "Courses/{courseCode}/CreateContent")



    try {

        let syllabus = course.sections.map((item: any) => {
            return item.title
        })

        payload = {
            context: course.details.title,
            key: "",
            text: "",
            index: 0,
            maxParagraphs: 15,
            courseStructure: syllabus,
            language: "es",
            courseCode: course.code
        }

        // Create Content
        const contentCycle = async (sectionCounter: number) => {

            const lessonCycle = async (lessonCounter: number) => {

                let currentParagraphs: any
                if (course.sections[sectionCounter].elements[lessonCounter].elementLesson.paragraphs.length == 0) {
                    payload.text = course.sections[sectionCounter].title
                    payload.index = sectionCounter
                    currentParagraphs = await createParagraphs(payload)
                    course.sections[currentParagraphs.sectionIndex].elements[lessonCounter].elementLesson.paragraphs = currentParagraphs.content.map((text: string) => {
                        return { content: text, audioScript: text }
                    })
                } else {

                   
                    currentParagraphs =  { "content": course.sections[sectionCounter].elements[lessonCounter].elementLesson.paragraphs, "sectionIndex": sectionCounter } 
                    course.sections[currentParagraphs.sectionIndex].elements[lessonCounter].elementLesson.paragraphs = currentParagraphs.content.map((text: string) => {
                        return { content: text, audioScript: text }
                    })
                }

                sectionCounter++

                // Create Audios & find images
                const multimediaCycle = async (paragraphCounter: number) => {

                    const paragraphContent = currentParagraphs.content[paragraphCounter]
                    const currentAudio = await createAudio(paragraphContent, "JorgeNeural", "es", course.code, currentParagraphs.sectionIndex, 0, paragraphCounter)
                    const currentParagrah = course.sections[currentAudio.sectionIndex].elements[lessonCounter].elementLesson.paragraphs[currentAudio.paragraphIndex]
                    console.info(`Audio for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                    currentParagrah["audioUrl"] = currentAudio.url

                    const extractedTitle = await extractTitle(paragraphContent, "es", course.code)
                    console.info(`Title for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} Extracted `)
                    currentParagrah["titleAI"] = extractedTitle.title

                    const currentImageData = await findImages(paragraphContent, extractedTitle.title, payload.text, course.details.title, "wide", "es", [], course.code)
                    console.info(`Image for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                    currentParagrah["imageData"] = currentImageData

                    const keyPhrases = await createkeyphrases(paragraphContent, "es", course.code)
                    currentParagrah["keyPhrases"] = keyPhrases
                    console.info(`KeyPhrases for section ${sectionCounter}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)

                    //create an empty video structure too
                    currentParagrah["videoData"] = {
                        thumb: { url: "", width: 0, height: 0 },
                        finalVideo: { url: "", width: 0, height: 0 }
                    }


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
                            await contentCycle(sectionCounter)
                        }

                    } else {
                        await multimediaCycle(paragraphCounter)
                    }
                }
                await multimediaCycle(0)
                if (course.sections[sectionCounter].elements.length > (lessonCounter + 1)) {
                    await lessonCycle(lessonCounter + 1)
                }
            }
            await lessonCycle(0)
        }
        contentCycle(0)

    } catch (error) {
        await saveLog(`Bad structure found in course: ${course.code}.`, "Error", "createContentCycle()", "Courses/{courseCode}/CreateContent")
        console.error(error)
        return
    }

}
