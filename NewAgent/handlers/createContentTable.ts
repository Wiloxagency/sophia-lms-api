import { Context, HttpRequest } from "@azure/functions";
import fs from "fs";
import path from "path";

import { createConnection } from "../../shared/mongo";
import { CourseData } from "../../shared/types";
import { parseForm } from "../utils/parseForm";
import { uploadFileToOpenAI } from "../utils/uploadFileToOpenAI";
import { generateContentTable } from "../utils/generateContentTable";

export async function handleCreateContentTable(
  context: Context,
  req: HttpRequest
) {
  const { fields, files } = await parseForm(req);

  const getField = (key: string) =>
    fields.find((f) => f.name === key)?.value || "";
  const courseCode = getField("courseCode");
  const voice = getField("voice");
  const language = getField("language");
  const languageName = getField("languageName");
  const maxSections = getField("maxSections");

  const db = await createConnection();
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

  const uploadedFile = await uploadFileToOpenAI(tempPath);
  const contentTable = await generateContentTable(
    uploadedFile.id,
    course,
    languageName,
    maxSections
  );

  await Courses.findOneAndUpdate(
    { code: courseCode },
    {
      $set: {
        openAIFileId: uploadedFile.id,
        voice,
        language,
        languageName,
      },
    }
  );

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { contentTable },
  };
}
