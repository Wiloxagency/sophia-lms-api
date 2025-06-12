import { Context, HttpRequest } from "@azure/functions";
import OpenAI from "openai";
import { createConnection } from "../../../shared/mongo";
import { CourseData } from "../../../shared/types";

const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function validateContentTable(context: Context, req: HttpRequest) {
  context.log("validateContentTable called");

  const { courseCode, contentTable } = req.body;

  const parsedContentTable = contentTable
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!courseCode || !parsedContentTable.length) {
    context.res = {
      status: 400,
      body: {
        isValid: false,
        reason: "Missing courseCode or contentTable is empty.",
      },
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

  const assistantId = "asst_ZqgmvxYMQ3fjrG1quGvhEWgd";

  let threadId = course.openAiStructureValidatorRunId;
  if (threadId) {
    context.log("Reusing existing thread:", threadId);
  } else {
    const thread = await openAiClient.beta.threads.create();
    threadId = thread.id;
    context.log("Created new thread:", threadId);

    // Save the threadId into the course
    await Courses.updateOne(
      { _id: course._id },
      { $set: { openAiStructureValidatorRunId: threadId } }
    );
  }

  const prompt = `
Analyze the following table of contents using the attached course documents.

For each item, determine whether the course materials contain **at least one paragraph** that **specifically discusses the topic**.

Evaluate **all items at once**, not iteratively. Your goal is to produce a comprehensive validation result.

Only if **every item** is adequately supported, return: isValid = true.

If **any items** are not clearly covered by the materials, return: isValid = false, and include **a full list of all such items** in the "reason". Do not withhold any items for future runs.

Also include a field called \`log\` in your response that says how many total items were evaluated, for debugging purposes.

Table of Contents:
${parsedContentTable.join("\n")}
`;

  context.log("Sending user message to thread");

  await openAiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content: prompt,
    attachments: course.openAIFileIds.map((file_id) => ({
      file_id,
      tools: [{ type: "file_search" }],
    })),
  });

  await delay(4000); // Wait for file indexing
  context.log("Waited for file indexing");

  const run = await openAiClient.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    tool_choice: {
      type: "function",
      function: { name: "submitValidation" },
    },
  });

  context.log("Assistant run started:", run.id);

  let runStatus = run.status;
  let finalValidationResult = null;

  while (
    runStatus === "queued" ||
    runStatus === "in_progress" ||
    runStatus === "requires_action"
  ) {
    context.log("Run status:", runStatus);
    await delay(1000);

    const updatedRun = await openAiClient.beta.threads.runs.retrieve(
      threadId,
      run.id
    );
    runStatus = updatedRun.status;

    if (runStatus === "requires_action") {
      const toolCalls =
        updatedRun.required_action?.submit_tool_outputs?.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        throw new Error("Run requires action but no tool calls were found.");
      }

      context.log("Run requires action. Tool calls:", toolCalls);

      const toolOutputs = toolCalls.map((toolCall) => ({
        tool_call_id: toolCall.id,
        output: "Acknowledged",
      }));

      try {
        const parsedValidation = JSON.parse(toolCalls[0].function.arguments);

        if (!parsedValidation || typeof parsedValidation !== "object") {
          throw new Error("Parsed validation is not an object.");
        }

        const { isValid, unsupported, reason, log } = parsedValidation;

        if (typeof isValid !== "boolean" || typeof reason !== "string") {
          throw new Error("Validation object missing required fields.");
        }

        context.log(
          "Parsed validation result from tool call:",
          parsedValidation
        );
        finalValidationResult = parsedValidation;
      } catch (err) {
        context.log("Failed to parse tool call arguments:", err);
        context.res = {
          status: 500,
          body: {
            isValid: false,
            reason: `Failed to parse assistant tool call output: ${err}`,
          },
        };
        return;
      }

      await openAiClient.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs: toolOutputs,
      });

      context.log("Tool outputs submitted, resuming run");

      runStatus = "in_progress";
    }
  }

  context.log("Assistant run completed. Fetching messages...");

  const messages = await openAiClient.beta.threads.messages.list(threadId);
  context.log("Messages received:", messages.data.length);

  for (const msg of messages.data) {
    if (msg.role === "assistant") {
      const toolCalls = (msg as any).tool_calls;
      context.log("Assistant message:", msg.content);
      context.log("Tool calls (if any):", toolCalls);
    }
  }

  if (finalValidationResult) {
    context.res = {
      status: 200,
      body: finalValidationResult,
    };
    return;
  }

  context.res = {
    status: 500,
    body: {
      isValid: false,
      reason: "No valid tool call was made by the assistant.",
    },
  };
}
