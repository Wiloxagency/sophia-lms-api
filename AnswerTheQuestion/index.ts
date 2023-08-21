import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";
import { saveLog } from "../shared/saveLog";

// OpenAI Credentials
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
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
      body: response.data.choices[0].message.content,
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
