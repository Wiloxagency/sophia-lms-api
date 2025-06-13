// src/utils/validationUtils.ts
import { Context } from "@azure/functions";
import OpenAI from "openai";
import { createConnection } from "../../../shared/mongo";
import { CourseData } from "../../../shared/types";
import { getOrCreateThreadId, submitRunAndPoll } from "./openAi";
import { preparePrompt } from "./validationPrompt";

const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function validateContentWithOpenAI(
  body: any,
  context: Context
) {
  const { courseCode, contentTable } = body;
  const parsedContentTable = contentTable
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (!courseCode || !parsedContentTable.length) {
    return {
      status: 400,
      body: {
        isValid: false,
        reason: "Missing courseCode or contentTable is empty.",
      },
    };
  }

  const db = await createConnection();
  const Courses = db.collection<CourseData>("course");
  const course = await Courses.findOne({ code: courseCode });

  if (!course || !course.openAIFileIds?.length) {
    return {
      status: 404,
      body: { isValid: false, reason: "Course or associated files not found." },
    };
  }

  const threadId = await getOrCreateThreadId(course, openAiClient, Courses);
  const prompt = preparePrompt(parsedContentTable);

  await openAiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content: prompt,
    attachments: course.openAIFileIds.map((file_id) => ({
      file_id,
      tools: [{ type: "file_search" }],
    })),
  });

  const assistantId = "asst_ZqgmvxYMQ3fjrG1quGvhEWgd";

  return await submitRunAndPoll({
    openAiClient,
    threadId,
    assistantId,
    course,
    Courses,
    context,
  });
}
