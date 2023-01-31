import { createAudio } from "../shared/createAudios";
import { createParagraphs } from "../shared/createParagrahs"
import { paragraphCreation } from "../interfaces/paragraph"
import { createConnection } from "../shared/mongo";

const database = createConnection()

export async function createContentCycle(course: any) {

    let payload: paragraphCreation
    if (!(course.sections && course.sections.length > 0)) {
        console.error("Course has not sections")
        return
    }

    try {

        let syllabus = course.sections.map((item: any) => {
            return item.title
        })

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
                console.info("payload -->", payload)
                const currentParagraphs = await createParagraphs(payload)
                console.info("Title -->", syllabus[currentParagraphs.sectionIndex])
                console.info("currentParagraphs -->", currentParagraphs)
                course.sections[currentParagraphs.sectionIndex].elements[0].paragraphs = currentParagraphs.content.map((text: string) => {
                    return {content: text}
                })
                sectionCounter++

                // Create Audios
                const audioCycle = async (paragraphCounter: number) => {
                    const currentAudio = await createAudio(currentParagraphs.content[paragraphCounter], "JorgeNeural", "es", currentParagraphs.sectionIndex, 0, paragraphCounter)
                    console.info("currentAudio -->", currentAudio)
                    course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex]["audioUrl"] = currentAudio.url
                    paragraphCounter++
                    if (paragraphCounter == currentParagraphs.content.length) {
                        console.info("Paragraphs Finished -->", currentParagraphs.sectionIndex, sectionCounter, paragraphCounter)
                        if (sectionCounter == syllabus.length) {
                            console.info("Course Finished ")
                            console.info(course)
                            // Save course (in the future be necessary to check if content was 100% fine generated)
                            const db =  await database
                            const Course = db.collection("course")
                            await Course.findOneAndUpdate({ code: course.code }, {
                                $set: { sections: course.sections }
                            })
                            console.info("Course Saved ")
                        } else {
                            contentCycle(sectionCounter)
                        }
                        
                    } else {
                        audioCycle(paragraphCounter)
                    }
                }
                audioCycle(0)


            }
            contentCycle(0)


        //})


    } catch (error) {
        console.error("Bad structure in current course")
        console.error(error)
        return
    }






}
