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
        await saveLog(`Course: ${course.code} has not sections`, "Error", "createContentCycle()", "Courses/{courseCode}/CreateContent")
        return
    }

    const db = await database
    const Courses = db.collection("course")

    await Courses.findOneAndUpdate({ code: course.code }, {
        $set: { 
            sections: course.sections,
            language: course.language,
            languageName: course.languageName,
            voice: course.voice
        }
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
            language: course.language.split("-")[0],
            languageName: course.languageName,
            courseCode: course.code
        }

        console.info("payload 51", payload)

        // Create Content
        const contentCycle = async (sectionCounter: number) => {

            const lessonCycle = async (lessonCounter: number) => {

                let currentParagraphs: any
                if (course.sections[sectionCounter].elements[lessonCounter].elementLesson.paragraphs.length == 0) {
                    console.warn("creating paragraph")
                    payload.text = course.sections[sectionCounter].title
                    payload.index = sectionCounter
                    currentParagraphs = await createParagraphs(payload)
                    course.sections[currentParagraphs.sectionIndex].elements[lessonCounter].elementLesson.paragraphs = currentParagraphs.content.map((text: string) => {
                        return { content: text, audioScript: text }
                    })
                } else {


                    currentParagraphs = { "content": course.sections[sectionCounter].elements[lessonCounter].elementLesson.paragraphs, "sectionIndex": sectionCounter }
                    course.sections[currentParagraphs.sectionIndex].elements[lessonCounter].elementLesson.paragraphs = currentParagraphs.content.map((text: string) => {
                        return { content: text, audioScript: text }
                    })
                }

                // Create Audios & find images
                const multimediaCycle = async (paragraphCounter: number) => {

                    const paragraphContent = currentParagraphs.content[paragraphCounter]

                    const currentAudio = await createAudio(paragraphContent, course.voice, course.language, course.code, currentParagraphs.sectionIndex, lessonCounter, paragraphCounter)
                    const currentParagrah = course.sections[currentAudio.sectionIndex].elements[lessonCounter].elementLesson.paragraphs[currentAudio.paragraphIndex]
                    console.info(`Audio for section ${sectionCounter + 1}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                    currentParagrah["audioUrl"] = currentAudio.url
                    if (
                        course.createAvatarIntro &&
                        paragraphCounter == 0 &&
                        currentAudio.sectionIndex == 0 &&
                        currentAudio.paragraphIndex == 0
                    ) {
                        // const DIDTalks = async () => {
                        const DIDTalksResponse = await fetch('https://api.d-id.com/talks', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Basic YldGemRHVnlRSGRwYkc5NFlXZGxibU41TG1OdmJROmtxNHVkdFd0OFg4M2tIODYtWVB6Zw==',
                                'Content-Type': 'application/json'
                            },
                            // body: '{\n    "source_url": "https://sophieassets.blob.core.windows.net/images/sofio.png",\n    "script": {\n        "type": "text",\n        "input": "Esta es una prueba hecha desde Postman.",\n        "provider": {\n            "type": "microsoft",\n            "voice_id": "es-CL-LorenzoNeural"\n        }\n    }\n}',
                            body: JSON.stringify({
                                'source_url': 'https://sophieassets.blob.core.windows.net/images/sofio.png',
                                'script': {
                                    'type': 'text',
                                    'input': paragraphContent,
                                    'provider': {
                                        'type': 'microsoft',
                                        'voice_id': 'es-CL-LorenzoNeural'
                                    }
                                }
                            })
                        })
                        let DIDTalksResponseParsed = await DIDTalksResponse.json()
                        let DIDIntroVideoId = DIDTalksResponseParsed.id
                        // console.log(DIDIntroVideoId)

                        await Courses.findOneAndUpdate({ code: course.code }, {
                            $set: { avatarIntroUrl: DIDIntroVideoId }
                        })

                        // }
                        // DIDTalks()
                    }
                    const extractedTitle = await extractTitle(paragraphContent, payload.text, course.languageName, course.details.title, course.code, )
                    console.info(`Title for section ${sectionCounter + 1}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} Extracted `)
                    currentParagrah["titleAI"] = extractedTitle.title

                    const currentImageData = await findImages(paragraphContent, extractedTitle.title, payload.text, course.details.title, "wide", course.languageName, [], course.code)
                    console.info(`Image for section ${sectionCounter + 1}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
                    currentParagrah["imageData"] = currentImageData

                    const keyPhrases = await createkeyphrases(paragraphContent, course.languageName, course.code)
                    currentParagrah["keyPhrases"] = keyPhrases
                    console.info(`KeyPhrases for section ${sectionCounter + 1}/${course.sections.length}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)

                    //create an empty video structure too
                    currentParagrah["videoData"] = {
                        thumb: { url: "", width: 0, height: 0 },
                        finalVideo: { url: "", width: 0, height: 0 }
                    }


                    paragraphCounter++
                    totalParagraphCounter++

                    if (paragraphCounter == currentParagraphs.content.length) {
                        if ((sectionCounter + 1) == syllabus.length) {

                            await saveLog(`Finish content creating for course: ${course.code}`, "Info", "createContentCycle()", "Courses/{courseCode}/CreateContent")

                            // Save course (in the future be necessary to check if content was 100% fine generated)

                            await Courses.findOneAndUpdate({ code: course.code }, {
                                $set: { sections: course.sections }
                            })
                            const endCreation = new Date()
                            const totalCreationTime = Math.abs(Math.round((startCreation.getTime() - endCreation.getTime()) / 1000 / 60))
                            await saveLog(`Update content for course: ${course.code}. ${course.sections.length} Sections and ${totalParagraphCounter} Slides was created in ${totalCreationTime} minutes.`, "Info", "createContentCycle()", "Courses/{courseCode}/CreateContent")
                        } else {
                            await Courses.findOneAndUpdate({ code: course.code }, {
                                $set: { sections: course.sections }
                            })

                            if (lessonCounter < course.sections[sectionCounter].elements.length - 1) {
                                await lessonCycle(lessonCounter + 1)
                            } else {
                                await contentCycle(sectionCounter + 1)
                            }

                        }

                    } else {
                        await multimediaCycle(paragraphCounter)
                    }
                }
                await multimediaCycle(0)
                // if (course.sections[sectionCounter].elements.length > (lessonCounter+1)) {
                //     await lessonCycle(lessonCounter+1)
                // }
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
