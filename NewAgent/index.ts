import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { addDocumentsSections } from "../CreateContent";
import { asyncCreateContent } from "../CreateContent/asyncCycle";
import { CourseData } from "../shared/types";
import { createConnection } from "../shared/mongo";
import { LanguageCode, LanguageName } from "../shared/languages";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const task = req.query.task;

    if (!task) {
      context.res = {
        status: 400,
        body: { error: "Missing query parameter: task" },
      };
      return;
    }

    switch (task) {
      case "createContentTable": {
        const { fields, files } = await parseMultipartFormData(req);

        const getField = (key: string) =>
          fields.find((f) => f.name === key)?.value || "";

        const courseCode = getField("courseCode");
        const voice = getField("voice");
        const language: LanguageCode = getField("language");
        const languageName: LanguageName = getField("languageName");
        const maxSections = getField("maxSections");

        const db = await database;
        const Courses = db.collection<CourseData>("course");

        const course = await Courses.findOne({ code: courseCode });
        if (!course) {
          context.res = {
            status: 404,
            body: { error: "Course not found" },
          };
          return;
        }

        const file = files[0];
        const tempPath = path.join(__dirname, file.filename);
        fs.writeFileSync(tempPath, Buffer.from(file.bufferFile));

        const uploadedFile = await client.files.create({
          file: fs.createReadStream(tempPath),
          purpose: "assistants",
        });

        const prompt = `Analyze the attached document and create a table of contents based on its content. Write it in ${languageName}, with exactly ${maxSections} items. This table of contents belongs to a course called: "${course.details.title}". If helpful, consider the course description:\n"${course.details.summary}".\nThe first item should be the introduction of the course and the last item should be the conclusion.\nwrite that table of contents in the following format:\n\n1. Introduction.\n2. Item 2.\n3. Item 3.\n...\n${maxSections}. Conclusion.\n\nDon't write any text before the introduction (item 1) and after the Conclusion (item ${maxSections}) only write the content table without any additional description.`;

        const response = await client.responses.create({
          model: "gpt-4o",
          input: [
            {
              role: "user",
              content: [
                { type: "input_file", file_id: uploadedFile.id },
                { type: "input_text", text: prompt },
              ],
            },
          ],
        });

        const outputText = response.output_text;
        const contentTable = outputText.split("\n");

        await db.collection("course").findOneAndUpdate(
          { code: courseCode },
          {
            $set: {
              openAIFileId: uploadedFile.id,
              voice: voice,
              language: language,
              languageName: languageName,
            },
          }
        );

        context.res = {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: {
            contentTable,
          },
        };
        return;
      }

      case "createCourse": {
        // Expect content from body instead of parsing again
        const { courseCode, structure } =
          req.body || {};

        if (!courseCode || !structure) {
          context.res = {
            status: 400,
            body: { error: "Missing required fields in request body." },
          };
          return;
        }

        const db = await database;
        const Courses = db.collection<CourseData>("course");
        const course = await Courses.findOne({ code: courseCode });

        if (!course) {
          context.res = {
            status: 404,
            body: { error: "Course not found" },
          };
          return;
        }

        const addedSections = addDocumentsSections(
          course,
          structure,
          course.slideshowColorThemeName
        )["sections"];

        // console.log(" addedSections: ", addedSections)

        const expandedCourse: Partial<CourseData> & {
          generationType: string;
        } = {
          ...course,
          sections: addedSections,
          generationType: "newAgent",
        };

        await asyncCreateContent(expandedCourse);

        context.res = {
          status: 200,
          body: {
            message: "Course creation initiated",
          },
        };
        return;
      }

      default: {
        context.res = {
          status: 400,
          body: { error: `Unknown task: ${task}` },
        };
        return;
      }
    }
  } catch (err) {
    context.log.error("Error in function:", err);
    context.res = {
      status: 500,
      body: { error: "Internal Server Error", details: err.message },
    };
  }
};

export default httpTrigger;
