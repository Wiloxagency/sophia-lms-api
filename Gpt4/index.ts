import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // const response = await openai.createChatCompletion({
    //     model: "gpt-4",
    //     messages: [
    //         {
    //             role: "system",
    //             content: 'You are a helpful assistant.'
    //         },
    //         {
    //             role: "user",
    //             content: req.body.prompt
    //         }
    //     ]
    // })

    console.info(req.body.prompt);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: req.body.role,
        },
        {
          role: "user",
          content: req.body.prompt,
        },
      ],
    });

    // console.log(response.data.choices[0].message.content)
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: response.choices[0].message.content,
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
