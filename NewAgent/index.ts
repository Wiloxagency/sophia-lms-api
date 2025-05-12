import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { addDocumentsSections, addSections } from "../CreateContent";
import { asyncCreateContent } from "../CreateContent/asyncCycle";
import { CourseData } from "../shared/types";
import { createConnection } from "../shared/mongo";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { fields, files } = await parseMultipartFormData(req);

  const getField = (key: string) =>
    fields.find((f) => f.name === key)?.value || "";

  const courseCode = getField("courseCode");
  const voice = getField("voice");
  const language = getField("language");
  const languageName = getField("languageName");
  const maxSections = getField("maxSections");

  const db = await database;

  const Courses = db.collection<CourseData>("course");

  let course: CourseData = await Courses.findOne({ code: courseCode });

  // Save uploaded file to the same folder where the function code is located
  const file = files[0];
  const tempPath = path.join(__dirname, file.filename); // Save in the current function directory

  fs.writeFileSync(tempPath, Buffer.from(file.bufferFile));

  // Upload file to OpenAI for use in file-based chat
  const uploadedFile = await client.files.create({
    file: fs.createReadStream(tempPath),
    purpose: "assistants", // still required, even for responses.create
  });

  // console.log("Uploaded file details:", uploadedFile); // Debugging the uploaded file

  // Build the prompt, clearly asking for the table of contents based on the file content
  const prompt = `Analyze the attached document and create a table of contents based on its content. Write it in ${course.languageName}, with exactly ${maxSections} items. This table of contents belongs to a course called: "${course.details.title}". If helpful, consider the course description:\n"${course.details.summary}".\nThe first item should be the introduction of the course and the last item should be the conclusion.\nwrite that table of contents in the following format:\n\n1. Introduction.\n2. Item 2.\n3. Item 3.\n...\n${maxSections}. Conclusion.\n\nDon't write any text before the introduction (item 1) and after the Conclusion (item ${maxSections}) only write the content table without any additional description.`;

  // Use `responses.create` to ask about the file
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

  // console.log("Response:", response); // Debugging the full response

  // Directly use the `output_text` field from the response
  const outputText = response.output_text;
  const contentTable = outputText.split("\n");

  // console.log("Output Text:", outputText); // Check the parsed output
  let addedSections = addDocumentsSections(
    contentTable,
    outputText,
    course.slideshowColorThemeName
  )["sections"];

  // console.log(" addedSections: ", addedSections);

  let expandedCourse: Partial<CourseData> & { generationType: string } = {
    ...course,
    sections: addedSections,
    voice: voice,
    language: language,
    languageName: languageName,
    generationType: "newAgent",
  };

  await asyncCreateContent(expandedCourse);

  context.res = {
    status: 200,
    body: {
      message: "Course creation initiated",
    },
  };
};

export default httpTrigger;
