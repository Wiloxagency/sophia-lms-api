import { Configuration, OpenAIApi } from 'openai'
import { titleExtraction } from "./gpt3.prompt"
import { saveLog } from '../shared/saveLog'

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)


export async function extractTitle(
    paragraph: string, 
    language: string, 
    courseCode:string): Promise<{ title: string }> {

    const prompt = titleExtraction[language]["prompt"].
        replace(/v{text}/g, paragraph)
    let titleAIObj: any
    let mainPhrase: string = ""

    try {
        titleAIObj = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.2,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        })
        mainPhrase = titleAIObj.data.choices[0].text.replace(/[\r\n]/gm, '').trim()
        return {title: mainPhrase}
            
    } catch (error) {
        console.error("Error trying to extract a title --> ", error)
        await saveLog(`Error trying to extract a title for course: ${courseCode}.`, "Error", "extractTitle()", "Courses/{courseCode}/CreateContent")
        return {title: undefined}
    }

}