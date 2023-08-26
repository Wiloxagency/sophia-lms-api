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

  try {
    const db = await database;
    const Courses = db.collection("course");

    const resp = await Courses.aggregate(
      [
        {
          '$match': {
            'code': req.params.courseCode
          }
        }, {
          $unwind: "$sections"
        },
        {
          $unwind: "$sections.elements"
        },
        {
          $unwind: "$sections.elements.elementLesson"
        },
        {
          $unwind: "$sections.elements.elementLesson.paragraphs"
        },
        {
          $group: {
            _id: null,
            contents: {
              $push: "$sections.elements.elementLesson.paragraphs.content"
            }
          }
        },
        {
          $project: {
            _id: 0,
            contents: 1
          }
        }
      ]
    ).toArray()

    // resp.sections.array.forEach((section: any) => {
    //   section.elements.forEach((element: any) => {
    //     element.elementLesson.forEach((lesson: any) => {
    //       element.elementLesson.forEach((lesson: any) => {

    //       });
    //     });
    //   });
    // });

    const prompt = req.body.prefix +
      " \n###\n" +
      resp[0].contents.join(" ") +
      "\n###\n" + 
      req.body.suffix +
      "\n###\n" +
      req.body.question +
      " \n###\n"


    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: req.body.role },
        { role: "user", content: prompt },
      ],
    });

    const extractedValue = response.data.choices[0].message.content;



    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { resp: extractedValue },
    };
  } catch (error) {
    await saveLog(
      `Error creating Chat Completion: ${error.message}`,
      "Error",
      "AzureFunction()",
      "AnswerTheQuestion"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { message: "Error" },
    };
  }
};

export default httpTrigger;
