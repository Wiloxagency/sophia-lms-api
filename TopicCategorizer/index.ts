import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Configuration, OpenAIApi } from 'openai'
import { saveLog } from "../shared/saveLog"

// Credenciais do OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        let topic = req.body.topic
        let conversationContext = req.body.context;

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: conversationContext
                },
                {
                    role: "user",
                    content: topic
                }
            ]
        });

        const categories = classifyTopic(topic + ' ' + conversationContext);

        // Retorna a resposta do modelo de linguagem da OpenAI e as categorias
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                categories: categories
            }
        };
    } catch (error) {
        // Registra e retorna um erro em caso de falha
        await saveLog(`Error creating Chat Completion, error: ${error.message} `, "Error", "AzureFunction()", "GPT")
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
}

// Função para classificar o texto em categorias
function classifyTopic(text: string): number[] {
    // Defina as palavras-chave associadas a cada categoria
    const categories = {
        "Technology": ["technology", "computers", "innovation"],
        "Nature": ["nature", "environment", "ecosystem"],
        "Travel": ["travel", "tourism", "destination"],
        "Food": ["food", "cuisine", "cooking"],
        "Health": ["health", "wellness", "medicine"],
        "Education": ["education", "learning", "school"],
        "People": ["people", "person", "society"],
        "Lifestyle": ["lifestyle", "living", "culture"],
        "Architecture": ["architecture", "building", "design"],
        "Animals": ["animals", "wildlife", "creature"],
        "Art and Culture": ["art", "culture", "heritage"],
        "Sports and Outdoor Activities": ["sports", "fitness", "outdoors"],
        "Fashion": ["fashion", "style", "clothing"],
        "Abstract Concepts": ["concept", "idea", "theory"],
        "Backgrounds/Textures": ["background", "texture", "pattern"]
    };

    // Percorra as categorias e verifique se alguma palavra-chave está presente no texto
    const matchedCategories: number[] = [];
    for (const [category, keywords] of Object.entries(categories)) {
        const regex = new RegExp(`\\b(?:${keywords.join('|')})\\b`, 'gi');
        if (regex.test(text)) {
            matchedCategories.push(parseInt(category));
        }
    }

    if (matchedCategories.length === 0) {
        matchedCategories.push(15);
    }

    return matchedCategories;
}
export default httpTrigger
