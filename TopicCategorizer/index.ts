import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from 'openai';
import { saveLog } from "../shared/saveLog";

// Credenciais do OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        let topic = req.body.topic;
        let conversationContext = req.body.context;

        const response = await openai.createChatCompletion({
            model: "gpt-4-1106-preview",
            messages: [
                {
                    role: "user",
                    content: `We have the following topic, '${topic},' based in the context of '${conversationContext}.' Classify it within the most suitable categories considering the following options: 1. Technology 2. Nature 3. Travel 4. Food 5. Health 6. Education 7. People 8. Lifestyle 9. Architecture 10. Animals 11. Art and Culture 12. Sports and Outdoor Activities 13. Fashion 14. Abstract Concepts 15. Backgrounds/Textures. If it cannot be classified within any specific category, use category number 15.\nThe output format must be json with the following structure:\n{'categories': numbers[]}`
                }
            ]
        });

        // Extrair as categorias da resposta
        let categories: any = response.data.choices?.[0]?.message?.content;

        // Retorna a resposta do modelo de linguagem da OpenAI e as categorias
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                content: categories
            }
        };
    } catch (error) {
        // Registra e retorna um erro em caso de falha
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