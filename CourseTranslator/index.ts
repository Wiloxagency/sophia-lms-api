import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog"
import axios, { AxiosResponse } from 'axios'
import { v4 as uuidv4 } from 'uuid'

const database = createConnection()

const COURSE_TRANSLATOR_SUBSCRIPTION_KEY = process.env.COURSE_TRANSLATOR_SUBSCRIPTION_KEY

const requestConfiguration = {
    // EduFactory
    headers: {
        'Ocp-Apim-Subscription-Key': COURSE_TRANSLATOR_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Region': 'eastus2',
        'charset': 'UTF-8'
    }
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    translateCourse(req)
    context.res = {
        "status": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": { response: "Course being translated" }
    }
}

async function translateCourse(req) {
    try {
        const db = await database
        const Courses = db.collection('course')
        const findCourseResponse = Courses.findOne({ "code": req.query.courseCode })
        const course = await findCourseResponse
        const courseClone = JSON.parse(JSON.stringify(course))
        delete courseClone._id
        delete courseClone.approvedBy

        courseClone.code = uuidv4()
        courseClone.details.title = await azureTranslateArray([{ Text: course.details.title }], req.query.targetLanguageFullISO)
        courseClone.details.summary = await azureTranslateArray([{ Text: course.details.summary }], req.query.targetLanguageFullISO)
        courseClone.approvalStatus = 'Pending approval'
        courseClone.language = req.query.targetLanguageFullISO
        courseClone.languageName = req.query.targetLanguageName
        courseClone.dateCreated = (new Date()).toISOString().split('T')[0]
        courseClone.voice = req.query.voice

        for await (const [indexSection, section] of course.sections.entries()) {
            courseClone.sections[indexSection].title
                = await azureTranslateArray([{ Text: section.title }], req.query.targetLanguageFullISO)

            for await (const [indexElement, element] of section.elements.entries()) {
                if (element.type == 'Lección Engine') {
                    for await (const [indexParagraph, paragraph] of element.elementLesson.paragraphs.entries()) {
                        let translatedParagraphContent
                            = await azureTranslateArray([{ Text: paragraph.content }], req.query.targetLanguageFullISO)

                        courseClone.sections[indexSection].elements[indexElement].elementLesson
                            .paragraphs[indexParagraph].content
                            = translatedParagraphContent

                        courseClone.sections[indexSection].elements[indexElement].elementLesson
                            .paragraphs[indexParagraph].audioScript
                            = translatedParagraphContent

                        courseClone.sections[indexSection].elements[indexElement].elementLesson
                            .paragraphs[indexParagraph].audioUrl
                            = ''

                        courseClone.sections[indexSection].elements[indexElement].elementLesson
                            .paragraphs[indexParagraph].keyPhrases = []

                        courseClone.sections[indexSection].elements[indexElement].elementLesson
                            .paragraphs[indexParagraph].splitAudioScript = []
                    }
                }
            }
        }
        const insertCoursePromise = Courses.insertOne(courseClone)
        const insertCourseResponse = await insertCoursePromise
    } catch (error) {
        await saveLog(`Error translating course. ` + error.message, "Error", "CourseTranslator", "CourseTranslator")
    }
}

async function azureTranslateArray(
    arrayToTranslate: [{ Text: string }],
    targetLanguageFullISO: string,
    indexSection?: number,
    indexElement?: number,
    indexParagraph?: number) {
    try {
        const body = await axios.post(
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + targetLanguageFullISO.slice(0, 2),
            arrayToTranslate,
            requestConfiguration
        )
            .then(async result => {
                return result.data[0].translations[0].text
            })
        // THIS IF BLOCK IS REQUIRED FOR THE ABOVE .then() TO WORK 🤷🏼‍♂️
        if (body) {
            return body
        }
    } catch (error) {
        await saveLog(`Error translating course. ` + error.message, "Error", "azureTranslateArray()", "CourseTranslator")
    }
}

export default httpTrigger;