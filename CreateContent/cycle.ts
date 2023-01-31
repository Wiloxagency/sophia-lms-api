import { createAudio } from "../shared/createAudios";
import { createParagraphs } from "../shared/createParagrahs"
import { paragraphCreation } from "../interfaces/paragraph"


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

            // Create Content

            const contentCycle = async (sectionCounter: number) => {

                const currentParagraphs = await createParagraphs(payload)
                console.info("Title -->", syllabus[currentParagraphs.sectionIndex])
                console.info("currentParagraphs -->", currentParagraphs)
                course.sections[currentParagraphs.sectionIndex].elements[0].paragraphs = currentParagraphs
                sectionCounter++

                // Create Audios
                const audioCycle = async (paragraphCounter: number) => {
                    const currentAudio = await createAudio(currentParagraphs.content[paragraphCounter], "JorgeNeural", "es", currentParagraphs.sectionIndex, 0, paragraphCounter)
                    console.info("currentAudio -->", currentAudio)
                    course.sections[currentAudio.sectionIndex].elements[0].paragraphs[currentAudio.paragraphIndex] = currentAudio.url
                    paragraphCounter++
                    if (paragraphCounter == currentParagraphs.content.length) {
                        console.info("Paragraphs Finished -->", currentParagraphs.sectionIndex, sectionCounter, paragraphCounter)
                        if (sectionCounter == syllabus.length) {
                            console.info("Course Finished ")
                            console.info(course)
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


        })


    } catch (error) {
        console.error("Bad structure in current course")
        console.error(error)
        return
    }






}
