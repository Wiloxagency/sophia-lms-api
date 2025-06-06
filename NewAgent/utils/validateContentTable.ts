import { Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../../shared/mongo";
import { CourseData } from "../../shared/types";
import OpenAI from "openai";

const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function validateContentTable(context: Context, req: HttpRequest) {
  const { courseCode, contentTable } = req.body;

  if (!courseCode || !Array.isArray(contentTable)) {
    context.res = {
      status: 400,
      body: { isValid: false, reason: "Missing courseCode or contentTable." },
    };
    return;
  }

  const db = await createConnection();
  const Courses = db.collection<CourseData>("course");
  const course = await Courses.findOne({ code: courseCode });

  if (!course || !course.openAIFileIds?.length) {
    context.res = {
      status: 404,
      body: { isValid: false, reason: "Course or associated files not found." },
    };
    return;
  }

  const assistant = await openAiClient.beta.assistants.create({
    name: "Content Table Validator",
    model: "gpt-4o",
    instructions: `
You are an academic assistant that verifies whether the provided course content (uploaded documents) supports each item in the given table of contents.
You must call the function 'submitValidation' with isValid=true if all topics are well-supported, or isValid=false with a reason listing unsupported items.
Only call the function once you're confident.
    `,
    tools: [
      {
        type: "function",
        function: {
          name: "submitValidation",
          description:
            "Submit the result of validating the table of content against the provided documents.",
          parameters: {
            type: "object",
            properties: {
              isValid: {
                type: "boolean",
                description: "Whether all topics are sufficiently supported",
              },
              reason: {
                type: "string",
                description:
                  "If isValid is false, explain what topics are missing or lacking support.",
              },
            },
            required: ["isValid"],
          },
        },
      },
      { type: "file_search" },
    ],
  });

  const thread = await openAiClient.beta.threads.create();

  const prompt = `
Analyze the following table of contents using the attached course documents.
Determine whether each item is adequately covered. Then call 'submitValidation' with your assessment.

Table of Contents:
${contentTable.map((item, i) => `${i + 1}. ${item}`).join("\n")}
`;

  await openAiClient.beta.threads.messages.create(thread.id, {
    role: "user",
    content: prompt,
    attachments: course.openAIFileIds.map((file_id) => ({
      file_id,
      tools: [{ type: "file_search" }],
    })),
  });

  const run = await openAiClient.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  let runStatus = run.status;
  while (runStatus === "queued" || runStatus === "in_progress") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updatedRun = await openAiClient.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    runStatus = updatedRun.status;
  }

  if (runStatus !== "completed") {
    context.res = {
      status: 500,
      body: { isValid: false, reason: `Assistant run failed: ${runStatus}` },
    };
    return;
  }

  const messages = await openAiClient.beta.threads.messages.list(thread.id);

  const assistantMessage = messages.data.find(
    (msg) => msg.role === "assistant" && "tool_calls" in msg
  );

  const toolCall = (assistantMessage as any)?.tool_calls?.[0];

  if (
    toolCall?.function?.name === "submitValidation" &&
    toolCall.function.arguments
  ) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      context.res = {
        status: 200,
        body: parsed,
      };
      return;
    } catch (err) {
      context.res = {
        status: 500,
        body: { isValid: false, reason: "Failed to parse function arguments." },
      };
      return;
    }
  }

  context.res = {
    status: 500,
    body: {
      isValid: false,
      reason: "No valid tool call was made by the assistant.",
    },
  };
}
