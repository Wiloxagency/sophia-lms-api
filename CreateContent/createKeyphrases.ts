import { Configuration, OpenAIApi } from "openai";
import { saveLog } from "../shared/saveLog";
import { keyphrases } from "./gpt3.prompt";

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function createkeyphrases(text: string, language:string, courseCode: string ): Promise< string[]> {
    
    const openai = new OpenAIApi(configuration);
    
    const prompt = keyphrases[language]["prompt"].
        replace(/v{text}/g, text.trim())

        try {

            const response = await openai.createCompletion({
                "model": "davinci:ft-wilox-2022-09-10-22-35-05",
                "prompt": prompt,
                "temperature": 0,
                "max_tokens": 250,
                "top_p": 1,
                "frequency_penalty": 1,
                "presence_penalty": 1,
                "stop": ["###", "\n\n"]
            })
        
            const keywords = response.data.choices[0].text.split("\n").
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