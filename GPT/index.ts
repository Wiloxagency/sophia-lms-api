import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
// import { cleanText } from "../CreateContent/cycle";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function chatCompletion() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: req.body.prompt,
          },
        ],
      });

      updateCourseTokens(
        req.body.courseCode,
        response.usage.prompt_tokens,
        response.usage.completion_tokens
      );

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
  }

  async function CreateCourseSummary() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "You will be given a text delimited by triple quotes.",
          },
          {
            role: "user",
            content: 'Text:"""' + req.body.courseTitle + '"""',
          },
          {
            role: "user",
            content:
              "Create a short description for a course teaching the content of the text. The descrition should be in Spanish.  Don't use any symbols or markup in your response. Don't use asterisks, quotes or hashtags.",
          },
          {
            role: "assistant",
            content: "Descripción del curso: ",
          },
        ],
      });

      updateCourseTokens(
        req.body.courseCode,
        response.usage.prompt_tokens,
        response.usage.completion_tokens
      );

      // let cleanResponse = cleanText(response.choices[0].message.content);

      // console.log(response.data.choices[0].message.content)
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: { response: response.choices[0].message.content },
      };
    } catch (error) {
      await saveLog(
        `Error creating course description, error: ${error.message} `,
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
  }

  if (req.query.createCourseSummary) {
    await CreateCourseSummary();
  } else {
    await chatCompletion();
  }
};

export default httpTrigger;
