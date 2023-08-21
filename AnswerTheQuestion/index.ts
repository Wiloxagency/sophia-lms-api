import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Configuration, OpenAIApi } from "openai";
import { saveLog } from "../shared/saveLog";
import { createConnection } from "../shared/mongo";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const getCourse = async (courseCode: string) => {
    try {
      const db = await database;
      const Courses = db.collection("course");

      const resp = Courses.aggregate([
        {
          $match: {
            code: courseCode,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "author_code",
            foreignField: "code",
            as: "createdBy",
          },
        },
        {
          $addFields: {
            createdBy: "$createdBy.name",
          },
        },
        {
          $unwind: {
            path: "$createdBy",
          },
        },
      ]);

      const body = await resp.toArray();

      if (body && body[0]) {
        console.log(
          "Retrieved course:",
          body[0].sections[0].elements[0].elementLesson.paragraphs[0].content
        );
      } else {
        console.log("Course not found");
      }
    } catch (error) {
      console.error("Error getting course:", error.message);
    }
  };

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: req.body.role },
        { role: "user", content: req.body.prompt },
      ],
    });

    const extractedValue = response.data.choices[0].message.content;

    await getCourse(extractedValue);

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: response.data.choices[0].message.content,
    };
  } catch (error) {
    await saveLog(
      `Error creating Chat Completion: ${error.message}`,
      "Error",
      "AzureFunction()",
      "GPT"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { message: "Error" },
    };
  }
};

export default httpTrigger;
