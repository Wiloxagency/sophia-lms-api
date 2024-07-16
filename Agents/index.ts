import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";


        const assistant = await openai.beta.assistants.create({
            name: "Financial Analyst Assistant",
            instructions: "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
            model: "gpt-4o",
            tools: [{ type: "file_search" }],
          });
          
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

export default httpTrigger;