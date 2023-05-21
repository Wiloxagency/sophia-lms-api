import { Configuration, OpenAIApi } from "openai";
import { saveLog } from "../shared/saveLog";
import { keyphrases } from "./prompts";

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function createkeyphrases(text: string, languageName:string, courseCode: string ): Promise< string[]> {
    
    const openai = new OpenAIApi(configuration);
    
    const prompt = keyphrases.
        replace(/v{text}/g, text.trim()).
        replace(/v{languageName}/g, languageName.trim())

        //console.info("Keyphrases prompt -->", prompt)

        try {

            const response = await openai.createCompletion({
                "model": "text-davinci-003",
                "prompt": prompt,
                "temperature": 0,
                "max_tokens": 250,
                "top_p": 1,
                "frequency_penalty": 1,
                "presence_penalty": 1
            })
        
            const keywords = response.data.choices[0].text.split(",").
                map(item => {
                    return item
                        .trim()
                        .replace(/- /, "")
                        .replace(/-/, "")
                        .replace(/\.$/, "")
                }).
                filter(item => {
                    return item.trim().length > 1
                })
            return keywords
            
            
        } catch (error) {
            await saveLog(`Error creating keyphrases in course: ${courseCode}.`, "Error", "createkeyphrases()", "Courses/{courseCode}/CreateContent")
            console.error(error)
            return
        }

   

}