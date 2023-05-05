import { Configuration, OpenAIApi } from 'openai'
import { contentTable } from "./prompts";
import { saveLog } from '../shared/saveLog';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function createContentTable(
    courseName: string, 
    maxSections: number, 
    language: string, 
    courseCode: string): Promise<string[]> {

    const openai = new OpenAIApi(configuration);

    const prompt = contentTable.
        replace(/v{maxSections}/g, maxSections.toString()).
        replace(/v{courseName}/g, courseName).
        replace(/v{languageName}/g, language)


        try {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 0.7,
                max_tokens: 2500,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            let splittedcontentTable = response.data.choices[0].text.
                replace(/\d{1,2}\./g, "").
                split("\n").
                map( item =>{
                    return item.trim()
                })
            
            return splittedcontentTable
        } catch (error) {
            await saveLog(`Error creating Content Table for course: ${courseCode}.`, "Error", "createContentTable()", "Courses/{courseCode}/CreateContent")
            return undefined
        }
    
}