import OpenAI from "openai";
import { CourseData } from "../../../shared/types";
import { Collection } from "mongodb";
import { Context } from "@azure/functions";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getOrCreateThreadId(
  course: CourseData,
  openAiClient: OpenAI,
  Courses: Collection<CourseData>
): Promise<string> {
  if (course.openAiStructureValidatorRunId) {
    console.log("Reusing thread:", course.openAiStructureValidatorRunId);
    return course.openAiStructureValidatorRunId;
  }

  const thread = await openAiClient.beta.threads.create();
  console.log("Created new thread:", thread.id);

  await Courses.updateOne(
    { code: course.code },
    { $set: { openAiStructureValidatorRunId: thread.id } }
  );
  return thread.id;
}

export async function submitRunAndPoll({
  openAiClient,
  threadId,
  assistantId,
  course,
  Courses,
  context,
}: {
  openAiClient: OpenAI;
  threadId: string;
  assistantId: string;
  course: CourseData;
  Courses: Collection<CourseData>;
  context: Context;
}) {
  context.log("Starting assistant run...");
  await delay(4000);

  // 🧪 DEBUG: Log attached files
  context.log("Attached file IDs:", course.openAIFileIds);

  for (const fileId of course.openAIFileIds) {
    try {
      const fileInfo = await openAiClient.files.retrieve(fileId);
      context.log(
        `File ${fileId}: purpose=${fileInfo.purpose}, filename=${fileInfo.filename}`
      );
    } catch (error) {
      context.log(`Failed to retrieve file ${fileId}:`, error);
    }
  }

  const run = await openAiClient.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    tool_choice: {
      type: "function",
      function: { name: "submitValidation" },
    },
  });

  context.log(`Run created with ID: ${run.id}, status: ${run.status}`);
  let runStatus = run.status;
  let finalValidationResult = null;

  while (
    runStatus === "queued" ||
    runStatus === "in_progress" ||
    runStatus === "requires_action"
  ) {
    await delay(1000);

    const updatedRun = await openAiClient.beta.threads.runs.retrieve(
      threadId,
      run.id
    );
    runStatus = updatedRun.status;
    context.log(`Polled run status: ${runStatus}`);

    if (runStatus === "requires_action") {
      const toolCalls =
        updatedRun.required_action?.submit_tool_outputs?.tool_calls;
      context.log("Tool calls required:", JSON.stringify(toolCalls, null, 2));

      if (!toolCalls?.length) {
        throw new Error("Run requires action but no tool calls were found.");
      }

      try {
        const parsedValidation = JSON.parse(toolCalls[0].function.arguments);
        finalValidationResult = parsedValidation;
        context.log(
          "Parsed tool call output:",
          JSON.stringify(parsedValidation, null, 2)
        );
      } catch (err) {
        return {
          status: 500,
          body: {
            isValid: false,
            reason: `Failed to parse assistant tool call output: ${err}`,
          },
        };
      }

      await openAiClient.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs: toolCalls.map((toolCall) => ({
          tool_call_id: toolCall.id,
          output: "Acknowledged",
        })),
      });

      runStatus = "in_progress";
    }
  }

  return finalValidationResult
    ? { status: 200, body: finalValidationResult }
    : {
        status: 500,
        body: {
          isValid: false,
          reason: "No valid tool call was made by the assistant.",
        },
      };
}
