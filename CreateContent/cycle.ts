import { createAudio } from "../shared/createAudios";
import { createParagraphs } from "../shared/createParagrahs"
import { paragraphCreation } from "../interfaces/paragraph"
import { createConnection } from "../shared/mongo";
import { findImages } from "../shared/findImages";

const database = createConnection()

export async function createContentCycle(course: any) {

    let payload: paragraphCreation
    if (!(course.sections && course.sections.length > 0)) {
        console.error("Course has not sections")
        return
    }

    const startCreation = new Date()
    let totalParagraphCounter = 0

    //console.info("course.sections ---> ", course.sections)
    try {

        let syllabus = course.sections.map((item: any) => {
            return item.title
        })

       //console.info("syllabus ---> ", syllabus)

        //syllabus.forEach(async (title: string, sectionIndex: number) => {

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
            //console.info("payload -->", payload)
            const currentParagraphs = await createParagraphs(payload)
            //console.info("Title -->", syllabus[currentParagraphs.sectionIndex])
            //console.info("currentParagraphs -->", currentParagraphs)
            course.sections[currentParagraphs.sectionIndex].elements[0].paragraphs = currentParagraphs.content.map((text: string) => {
                return { content: text }
            })
            sectionCounter++

            // Create Audios & find images
            const multimediaCycle = async (paragraphCounter: number) => {
                //console.info("Go to text to speech -->", currentParagraphs.content[paragraphCounter])
                const currentAudio = await createAudio(currentParagraphs.content[paragraphCounter], "JorgeNeural", "es", currentParagraphs.sectionIndex, 0, paragraphCounter)
                console.info(`Audio for section ${sectionCounter }/${course.sections.length}, paragraph ${paragraphCounter + 1 }/${currentParagraphs.content.length} created`)
                course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["audioUrl"] = currentAudio.url
                
                //console.info("Go to find images -->", currentParagraphs.content[paragraphCounter])
                const currentImageData =  await findImages(currentParagraphs.content[paragraphCounter], payload.text, course.details.title, "wide", "es", [])
                console.info(`Image for section ${sectionCounter }/${course.sections.length}, paragraph ${paragraphCounter + 1 }/${currentParagraphs.content.length} created`)
                course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["imageData"] = currentImageData
               
                paragraphCounter++
                totalParagraphCounter++
                if (paragraphCounter == currentParagraphs.content.length) {
                    //.info("Paragraphs Finished -->", currentParagraphs.sectionIndex, sectionCounter, paragraphCounter)
                    if (sectionCounter == syllabus.length) {
                        console.info("Course Finished ")
                        console.info(course)
                        // Save course (in the future be necessary to check if content was 100% fine generated)
                        const db = await database
                        const Course = db.collection("course")
                        await Course.findOneAndUpdate({ code: course.code }, {
                            $set: { sections: course.sections }
                        })
                        console.info("Course Saved ")
                        const endCreation = new Date()
                        const totalCreationTime = Math.abs(Math.round((startCreation.getTime() - endCreation.getTime()) / 1000 / 60))
                        console.info(`Course of ${course.sections.length} Sections and ${totalParagraphCounter} Slides was created in ${totalCreationTime} minutes.`)
                    } else {
                        contentCycle(sectionCounter)
                    }

                } else {
                    multimediaCycle(paragraphCounter)
                }
            }
            multimediaCycle(0)
        }
        contentCycle(0)


        //})


    } catch (error) {
        console.error("Bad structure in current course")
        console.error(error)
        return
    }






}
