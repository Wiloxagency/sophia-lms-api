import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { Configuration, OpenAIApi } from 'openai'
const database = createConnection()

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createShortAnswerQuiz = async () => {
        try {
            const db = await database
            const Courses = db.collection('course')
            // console.log(req.body)
            let coursePromise = Courses.findOne({ code: req.body.courseCode })
            let course = await coursePromise
            let lessonFirst5Paragraphs = course.sections[req.body.indexSection].elements[req.body.indexElement].elementLesson.paragraphs.slice(0, 5)
            let quizList = []
            for (const paragraph of lessonFirst5Paragraphs) {
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: 'You are a helpful assistant.'
                        },
                        {
                            role: "user",
                            content: 'Redacta una pregunta basada en el siguiente párrafo: ' + paragraph.content
                        }
                    ]
                })
                quizList.push({ question: response.data.choices[0].message.content })
            }
            // console.log(quizList)
            let sectionElementsPath = `sections.${req.body.indexSection}.elements`
            let sectionElements = course.sections[req.body.indexSection].elements
            let quizz_list = quizList
            let quizElementPayload = {
                type: 'shortAnswer',
                title: 'Quiz',
                elementQuiz: { quizz_list: quizz_list }
            }
            sectionElements.push(quizElementPayload)
            // console.log(sectionElements)
            const updatePromise = Courses.findOneAndUpdate({ code: req.body.courseCode }, {
                $set: {
                    [sectionElementsPath]: sectionElements
                }
            })
            await updatePromise
            // console.log(response.data.choices[0].message.content)
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": quizList
            }
        } catch (error) {
            // console.log(error)
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error"
                }
            }
        }
    }

    const createCompletionQuiz = async () => {
        try {
            const db = await database
            const Courses = db.collection('course')
            // console.log(req.body)
            let coursePromise = Courses.findOne({ code: req.body.courseCode })
            let course = await coursePromise
            let lessonFirst5Paragraphs = course.sections[req.body.indexSection].elements[req.body.indexElement].elementLesson.paragraphs.slice(0, 5)
            let quizList = []
            for (const paragraph of lessonFirst5Paragraphs) {
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: 'You are a helpful assistant.'
                        },
                        {
                            role: "user",
                            content: "Extrae la frase principal de un texto que te suministraré al final de estas especificaciones, para ser usada como una actividad de completación. La completación debe ocurrir en la palabra principal de la frase principal extraída. Solo debe haber una completación. La respuesta debe ser concisa y debe seguir el siguiente formato: Frase principal: Palabra extraída: El texto suministrado es: " + paragraph.content
                        }
                    ]
                })
                quizList.push({ question: response.data.choices[0].message.content })
            }
            // console.log(quizList)
            let sectionElementsPath = `sections.${req.body.indexSection}.elements`
            let sectionElements = course.sections[req.body.indexSection].elements
            let quizz_list = quizList
            let quizElementPayload = {
                type: 'completion',
                title: 'Quiz',
                elementQuiz: { quizz_list: quizz_list }
            }
            sectionElements.push(quizElementPayload)
            // console.log(sectionElements)
            const updatePromise = Courses.findOneAndUpdate({ code: req.body.courseCode }, {
                $set: {
                    [sectionElementsPath]: sectionElements
                }
            })
            await updatePromise
            // console.log(response.data.choices[0].message.content)
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": quizList
            }
        } catch (error) {
            // console.log(error)
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error"
                }
            }
        }
    }

    const correctCompletionQuiz = async () => {
        try {
            let GPTResponses = []
            for (const quiz of req.body.quizData) {
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: 'You are a helpful assistant.'
                        },
                        {
                            role: "user",
                            content: `Tienes el siguiente texto:
                                        ${quiz.base}
                                        En base a ese texto se creó la siguiente actividad de completación:
                                        ${quiz.text}
                                        Tienes la siguiente respuesta:
                                        ${quiz.studentResponse}
                                        ¿La respuesta completa correctamente la actividad de completación?
                                        `
                        }
                    ]
                })
                GPTResponses.push({ question: response.data.choices[0].message.content })
            }
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": GPTResponses
            }
        } catch (error) {
            // console.log(error)
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error"
                }
            }
        }
    }

    switch (req.method) {
        case "POST":

            if (req.body.operation == 'create') {
                if (req.body.quizType == 'multipleChoice') {
                    // await createMultipleChoiceQuiz()
                }
                if (req.body.quizType == 'shortAnswer') {
                    await createShortAnswerQuiz()
                }
                if (req.body.quizType == 'completion') {
                    await createCompletionQuiz()
                }
            } else if (req.body.operation == 'correct') {
                await correctCompletionQuiz()
            }

            break;

        default:
            break;
    }
}

export default httpTrigger