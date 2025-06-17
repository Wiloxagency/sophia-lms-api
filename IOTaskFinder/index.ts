import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TASKFINDER_ASSISTANT_ID =
  process.env.TASKFINDER_ASSISTANT_ID || "asst_gyvOLScQ2f61sVQnsBxWHZo4";

async function waitForRunCompletion(threadId: string, runId: string) {
  let run;
  let retries = 30;

  do {
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (run.status === "completed") return run;
    if (run.status === "failed" || run.status === "cancelled")
      throw new Error(`Run ${run.status}`);
    await new Promise((r) => setTimeout(r, 1000));
  } while (retries-- > 0);

  throw new Error("Run did not complete in time");
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const jobTitle = req.query.job || req.body?.job;
  console.log(" jobTitle: ", jobTitle);

  if (!jobTitle) {
    context.res = {
      status: 400,
      body: { error: "Missing required 'job' parameter." },
    };
    return;
  }

  try {
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      //   content: `My profession is: ${jobTitle}`,
      content: `${jobTitle}`,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: TASKFINDER_ASSISTANT_ID,
    });

    await waitForRunCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((m) => m.role === "assistant");

    const output = lastMessage?.content?.[0];
    let responseJSON;

    if (output?.type === "text") {
      try {
        responseJSON = JSON.parse(output.text.value);
      } catch {
        responseJSON = {
          found: false,
          reason: "Failed to parse assistant response.",
        };
      }
    } else {
      responseJSON = {
        found: false,
        reason: "Unexpected response format from assistant.",
      };
    }

    console.log(" responseJSON: ", responseJSON);

    context.res = {
      status: 200,
      body: responseJSON,
    };
  } catch (err) {
    context.log.error("Error processing TaskFinder request:", err);
    context.res = {
      status: 500,
      body: { error: "Internal server error", detail: err.message },
    };
  }
};

export default httpTrigger;
