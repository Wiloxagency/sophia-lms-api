import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { fields, files } = await parseMultipartFormData(req);

  // Safely extract form fields
  const getField = (key: string) =>
    fields.find((f) => f.name === key)?.value || "";

  const courseName = getField("courseName");
  const courseDescription = getField("courseDescription");
  const languageName = getField("languageName");
  const maxSections = getField("maxSections");

  // Save uploaded file to the same folder where the function code is located
  const file = files[0];
  const tempPath = path.join(__dirname, file.filename); // Save in the current function directory

  fs.writeFileSync(tempPath, Buffer.from(file.bufferFile));

  // Upload file to OpenAI for use in file-based chat
  const uploadedFile = await client.files.create({
    file: fs.createReadStream(tempPath),
    purpose: "assistants", // still required, even for responses.create
  });

  console.log("Uploaded file details:", uploadedFile); // Debugging the uploaded file

  // Build the prompt, clearly asking for the table of contents based on the file content
  const prompt = `Analyze the attached document and create a table of contents based on its content. Write it in ${languageName}, with exactly ${maxSections} items. This table of contents belongs to a course called: "${courseName}". If helpful, consider the course description:\n"${courseDescription}".\nThe first item should be the introduction of the course and the last item should be the conclusion.\nwrite that table of contents in the following format:\n\n1. Introduction.\n2. Item 2.\n3. Item 3.\n...\n${maxSections}. Conclusion.\n\nDon't write any text before the introduction (item 1) and after the Conclusion (item ${maxSections}) only write the content table without any additional description.`;

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

  console.log("Response:", response); // Debugging the full response

  // Directly use the `output_text` field from the response
  const outputText = response.output_text;

  console.log("Output Text:", outputText); // Check the parsed output

  context.res = {
    status: 200,
    body: {
      fileId: uploadedFile.id,
      tableOfContents: outputText,
    },
  };
};

export default httpTrigger;
