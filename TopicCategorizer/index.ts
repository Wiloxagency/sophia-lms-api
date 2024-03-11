import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { getTopicCategories } from "./categorizer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    let topic = req.body.topic;
    let conversationContext = req.body.context;

    // const getTopicCategoriesResponse = await getTopicCategories(
    //   topic,
    //   conversationContext
    // );

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: 'getTopicCategoriesResponse',
      // body: getTopicCategoriesResponse,
    };
  } catch (error) {
    await saveLog(
      `Error creating Chat Completion, error: ${error.message} `,
      "Error",
      "AzureFunction()",
      "GPT"
    );
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
