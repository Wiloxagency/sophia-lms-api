import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog"
import axios, { AxiosResponse } from 'axios'
import { v4 as uuidv4 } from 'uuid'

const database = createConnection()


// const COURSE_TRANSLATOR_SUBSCRIPTION_KEY = process.env.COURSE_TRANSLATOR_SUBSCRIPTION_KEY
const COURSE_TRANSLATOR_SUBSCRIPTION_KEY = '569573b0d7c9412887eaef823b637e01'

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
    try {
        const db = await database
        const Courses = db.collection('course')
        const findCourseResponse = Courses.findOne({ "code": req.query.courseCode })
        const course = await findCourseResponse
        const courseClone = JSON.parse(JSON.stringify(course))
        delete courseClone._id

        courseClone.code = uuidv4()
        courseClone.details.title = await translateArray([{ Text: course.details.title }], req.query.targetLanguage)
        courseClone.details.summary = await translateArray([{ Text: course.details.summary }], req.query.targetLanguage)
        courseClone.approvalStatus = 'Pending approval'
        courseClone.language = req.params.targetLanguage
        courseClone.languageName = req.params.languageName
        courseClone.dateCreated = (new Date()).toISOString().split('T')[0]

        for await (const [indexSection, section] of course.sections.entries()) {
            courseClone.sections[indexSection].title
                = await translateArray([{ Text: section.title }], req.query.targetLanguage)

            for await (const [indexElement, element] of section.elements.entries()) {
                if (element.type == 'Lección Engine') {
                    for await (const [indexParagraph, paragraph] of element.elementLesson.paragraphs.entries()) {
                        let translatedParagraphContent
                            = await translateArray([{ Text: paragraph.content }], req.query.targetLanguage)

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

        if (insertCourseResponse) {
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": insertCourseResponse
            }
        } else {
            await saveLog(`Error translating course ` + req.query.courseCode, "Error", "CourseTranslator", "CourseTranslator")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error translating course"
                }
            }
        }
    }
    catch (error) {
        await saveLog(`Error translating course. ` + error.message, "Error", "CourseTranslator", "CourseTranslator")
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error translating course"
            }
        }
    }
}

async function translateArray(
    arrayToTranslate: [{ Text: string }],
    targetLanguage: string,
    indexSection?: number,
    indexElement?: number,
    indexParagraph?: number) {
    try {
        const body = await axios.post(
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + targetLanguage,
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
        await saveLog(`Error translating course. ` + error.message, "Error", "translateArray()", "CourseTranslator")
    }
}

export default httpTrigger;