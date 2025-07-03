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

  // Save uploaded file temporarily
  const file = files[0];
  const tempPath = path.join(__dirname, file.filename);
  fs.writeFileSync(tempPath, Buffer.from(file.bufferFile));

  const uploadedFiles = await uploadFileToOpenAI(tempPath);
  console.log(" uploadedFiles: ", uploadedFiles);
  const fileIds = uploadedFiles.map((f) => f.id);

  let contentTable: { sectionTitle: string; sectionContent: string }[] | null;

  if (uploadedFiles.length === 0) {
  } else {
    contentTable = await generateContentTable(
      fileIds,
      course,
      languageName,
      maxSections
    );
  }

  await Courses.findOneAndUpdate(
    { code: courseCode },
    {
      $set: {
        openAIFileIds: fileIds,
        voice,
        language,
        languageName,
        isFinishedUploadingOpenAiFiles:
          uploadedFiles.length === 0 ? false : true,
      },
    }
  );

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { contentTable },
  };
}
