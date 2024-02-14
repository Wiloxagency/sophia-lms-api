import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        let topic = req.body.topic;
        let conversationContext = req.body.context;

        const response = await openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [
                {
                    role: "user",
                    content: `We have the following topic, '${topic},' based in the context of '${conversationContext}'. Classify it within the most suitable categories considering the following options: 1. Technology 2. Nature 3. Travel 4. Food 5. Health 6. Education 7. People 8. Lifestyle 9. Architecture 10. Animals 11. Art and Culture 12. Sports and Outdoor Activities 13. Fashion 14. Abstract Concepts 15. Backgrounds/Textures. If it cannot be classified within any specific category, use category number 15.
                    The output format must be JSON with the following structure:
                    {'categories': numbers[]}`
                }
            ]
        });

        const responseMessage = response.choices?.[0]?.message?.content || "";
        const categoriesRegex = /\d+/g;
        const extractedCategories = responseMessage.match(categoriesRegex);
        const categories = extractedCategories?.map(category => parseInt(category, 10)) || [];

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: { categories: categories }
        };

    } catch (error) {
        await saveLog(`Error creating Chat Completion, error: ${error.message} `, "Error", "AzureFunction()", "GPT");
        context.res = {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                message: "Error"
            }
        };
    }
};

export default httpTrigger;
