import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog"
import axios, { AxiosResponse } from 'axios'

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
    let tempBody = [
        {
            "Text": "Hallo. Bist du fertig?"
        }
    ]

    try {
        const db = await database
        const Courses = db.collection('course')
        const findCourseResponse = Courses.findOne({ "code": req.query.courseCode })
        const course = await findCourseResponse
        const courseClone = JSON.parse(JSON.stringify(course))

        // courseClone.details.title = await translateArray([{ Text: course.details.title }], req.query.targetLanguage)
        // courseClone.details.summary = await translateArray([{ Text: course.details.summary }], req.query.targetLanguage)
        courseClone.details.title = await translateArray([{ Text: course.details.title }], req.query.targetLanguage)
        courseClone.details.summary = 'This summary title has been translated'
        courseClone.sections
            .forEach((section: any, indexSection: number) => {
                courseClone.sections[indexSection].title = indexSection + ': This section title has been translated'

                section.elements
                    .forEach((element: any, indexElement: number) => {
                        if (element.type == 'Lección Engine') {

                            course.sections[indexSection].elements[indexElement].elementLesson.paragraphs
                                .forEach((paragraph: any, indexParagraph: number) => {

                                    courseClone.sections[indexSection].elements[indexElement].elementLesson
                                        .paragraphs[indexParagraph].content
                                        = indexParagraph + ': This paragraph content has been translated'

                                    courseClone.sections[indexSection].elements[indexElement].elementLesson
                                        .paragraphs[indexParagraph].audioScript
                                        = indexParagraph + ': This paragraph audio script has been translated'

                                    courseClone.sections[indexSection].elements[indexElement].elementLesson
                                        .paragraphs[indexParagraph].audioUrl
                                        = ''

                                    courseClone.sections[indexSection].elements[indexElement].elementLesson
                                        .paragraphs[indexParagraph].keyPhrases = []

                                    courseClone.sections[indexSection].elements[indexElement].elementLesson
                                        .paragraphs[indexParagraph].splitAudioScript = []
                                })
                        }
                    })
            })
        // console.log(courseClone)

        context.res = {
            "status": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": courseClone
        }
    }
    catch (error) {
        await saveLog(`Error translating course. ` + error.message, "Error", "CourseTranslator", "CourseTranslator")
    }
}

async function translateArray(
    arrayToTranslate: [{ Text: string }],
    targetLanguage: string,
    indexSection?: number,
    indexElement?: number,
    indexParagraph?: number) {
    // const url = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=de'
    //  + targetLanguage
    // console.log(url)
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