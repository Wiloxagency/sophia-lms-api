import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        const pantoneCode = req.body.pantoneCode
        const prompt = `According to some of any of these sites:

        https://icolorpalette.com/ 
        https://hexcolorpedia.com/
        https://encycolorpedia.com/
        
        what is the hexadecimal code for this:
        
        "Pantone ${pantoneCode}" ?
        
        Only provide me with the code, for example: "#aabbcc". 
        I want a very concise answer. 
        If the "Pantone ${pantoneCode}" color is not on the provided sites, you can obtain it from another site but do not make up any code, just say "null".`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: "You are an Pantone Color Expert." },
                { role: 'user', content: prompt },
            ],
            temperature: 0,
        });
        const answer = response.choices[0].message.content
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "hex": answer })
        };
    } catch (error) {
        context.res = {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                message: "Error",
            },
        };
    }
};

export default httpTrigger;