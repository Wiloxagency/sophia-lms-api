import { Configuration, OpenAIApi } from 'openai'
import { titleExtraction } from "./gpt3.prompt"
import { saveLog } from '../shared/saveLog'
import { searchImages} from "./prompts"

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)

const gptSearchImages = searchImages

export async function extractTitle(
    paragraphContent: string,
    sectionTitle: string,
    languageName: string,
    courseTitle: string,
    courseCode: string): Promise<{ title: string }> {

    const prompt = gptSearchImages.
        replace(/v{languageName}/g, languageName.trim()).
        replace(/v{courseName}/g, courseTitle.trim()).
        replace(/v{sectionTitle}/g, sectionTitle.trim()).
        replace(/v{paragraphContent}/g, paragraphContent.trim())

    //console.info("gptSearchImages prompt -->", prompt)

    // const prompt = titleExtraction["es"]["prompt"].
    //     replace(/v{text}/g, paragraphContent)
    // let titleAIObj: any
    // let mainPhrase: string = ""

    try {

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Software developer"
                },
                {
                    role: "user",
                    content: prompt
                }
            ]

        })
        let data = response.data.choices[0].message.content
        console.info("gptSearchImages response -->",data)
        const obj = JSON.parse(data)

        // titleAIObj = await openai.createCompletion({
        //     model: "text-davinci-003",
        //     prompt: prompt,
        //     temperature: 0.2,
        //     max_tokens: 500,
        //     top_p: 1,
        //     frequency_penalty: 0.5,
        //     presence_penalty: 0,
        // })
        // mainPhrase = titleAIObj.data.choices[0].text.replace(/[\r\n]/gm, '').trim()
        return { title: obj.resp }

    } catch (error) {

        await saveLog(`Error trying to extract a title for course: ${courseCode}. Error: ${error.message}`, "Error", "extractTitle()", "Courses/{courseCode}/CreateContent")
        return { title: "" }
    }

}