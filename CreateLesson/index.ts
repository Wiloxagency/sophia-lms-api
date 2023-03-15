import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createAudio } from "../CreateContent/createAudios";
import { createkeyphrases } from "../CreateContent/createKeyphrases";
import { createParagraphs } from "../CreateContent/createParagrahs";
import { findImages } from "../CreateContent/findImages";
import { extractTitle } from "../CreateContent/titleExtraction";
import { paragraphCreation } from "../interfaces/paragraph";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const db = await database
    const Course = db.collection("course")

    const payload: paragraphCreation = {
        context: req.body.courseTitle,
        key: "",
        text: req.body.lessonTitle,
        index: 0,
        maxParagraphs: 15,
        courseStructure: req.body.syllabus,
        language: "es",
        courseCode: req.body.courseCode
    }
    const lesson = {
        type: "Lección Engine",
        title: "Presentation",
        elementLesson: {
            lessonTheme: "1",
            paragraphs: []
        }
    }
    const currentParagraphs = await createParagraphs(payload)

    // Create Audios & find images
    const multimediaCycle = async (paragraphCounter: number) => {


        const paragraphContent = currentParagraphs.content[paragraphCounter]
        const currentParagrah = {
            content: paragraphContent,
            audioScript: paragraphContent,
            audioUrl: "",
            titleAI: "",
            imageData: {},
            keyPhrases: []
        }
        const sectionIndex = req.body.indexSection
        const currentAudio = await createAudio(paragraphContent, "JorgeNeural", "es", req.body.courseCode, sectionIndex, req.body.elementIndex, paragraphCounter)
        console.info(`Audio for section ${sectionIndex}}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
        currentParagrah.audioUrl = currentAudio.url

        const extractedTitle = await extractTitle(paragraphContent, "es", req.body.courseCode)
        console.info(`Title for section ${sectionIndex}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} Extracted `)
        currentParagrah.titleAI = extractedTitle.title

        const currentImageData = await findImages(paragraphContent, extractedTitle.title, payload.text, req.body.courseTitle, "wide", "es", [], req.body.courseCode)
        console.info(`Image for section ${sectionIndex}}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)
        currentParagrah.imageData = currentImageData

        const keyPhrases = await createkeyphrases(paragraphContent, "es", req.body.courseCode)
        currentParagrah.keyPhrases = keyPhrases
        console.info(`KeyPhrases for section ${sectionIndex}, paragraph ${paragraphCounter + 1}/${currentParagraphs.content.length} created`)

        //create an empty video structure too
        currentParagrah["videoData"] = {
            thumb: { url: "", width: 0, height: 0 },
            finalVideo: { url: "", width: 0, height: 0 }
        }

        lesson.elementLesson.paragraphs.push(currentParagrah)

        paragraphCounter++

        if (paragraphCounter == currentParagraphs.content.length) {

            await saveLog(`Completed course lesson creation for: ${req.body.courseCode}`, "Info", "multimediaCycle()", "Courses/{courseCode}/CreateLesson")

            // Save course (in the future be necessary to check if content was 100% fine generated)
            let sectionPath = `sections.${req.body.indexSection}.elements`
            await Course.updateOne(
                { code: req.body.courseCode },
                {
                    $push: { [sectionPath]: lesson }
                }
            )
        } else {
            await multimediaCycle(paragraphCounter)
        }
    }
    multimediaCycle(0)

    context.res = {
        "status": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": currentParagraphs
    }


};

export default httpTrigger;