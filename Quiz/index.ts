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
            let coursePromise = Courses.findOne({ code: req.body.courseCode })
            let course = await coursePromise
            console.log(course.sections[req.body.indexSection].elements[req.body.indexElement].paragraphs)

            return
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: "user",
                        content: req.body.prompt
                    }
                ]
            })
            // console.log(response.data.choices[0].message.content)
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": response.data.choices[0].message.content
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

            if (req.body.quizType == 'multipleChoice') {
                // await createMultipleChoiceQuiz()
            }
            if (req.body.quizType == 'shortAnswer') {
                await createShortAnswerQuiz()
            }
            if (req.body.quizType == 'completion') {

            }
            break;

        default:
            break;
    }
}

export default httpTrigger