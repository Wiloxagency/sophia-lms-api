import { Configuration, OpenAIApi } from 'openai'
import { contentTable } from "./gpt3.prompt";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function createContentTable(text: string, maxSections: number, language: string): Promise<string[]> {

    const openai = new OpenAIApi(configuration);

    const prompt = contentTable[language]["prompt"].
        replace(/v{text}/g, text).
        replace(/v{maxSections}/g, maxSections)

        try {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 0.7,
                max_tokens: 1500,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            const unformattedContenTable = `1. ${contentTable[language]["introduction"]}.\n2.${response.data.choices[0].text}`
            let splittedcontentTable = unformattedContenTable.
                replace(/\d{1,2}\./g, "").
                split("\n").
                map( item =>{
                    return item.trim()
                })
            
            return splittedcontentTable
        } catch (error) {
            console.error(error)
            return undefined
        }
    
}