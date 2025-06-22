import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MongoClient, ServerApiVersion } from "mongodb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ASSISTANT_ID =
  process.env.TASKFINDER_ASSISTANT_ID_IN_DB || "asst_RQXhWlUReYXwnG18bHQpZFBD";

const mongoConfig = {
  url: process.env.MONGODB_ATLAS_URI,
  dbName: "oi",
};

const options = {
  connectTimeoutMS: 100000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
};

const client = new MongoClient(mongoConfig.url, options);
const db = client.db(mongoConfig.dbName);

const getTasksForOccupationName = async (occupationName: string) => {
  const Occupations = db.collection("occupations");
  const doc = await Occupations.findOne({ name: occupationName });

  if (!doc || !doc.categories?.tasks?.length) {
    return {
      found: false,
      reason: "No se encontraron tareas para ese nombre de trabajo.",
    };
  }

  const tasks = doc.categories.tasks
    .sort((a: any, b: any) => b.importance - a.importance)
    .slice(0, 5)
    .map((t: any) => t.task);

  return {
    found: true,
    occupation: occupationName,
    tasks,
  };
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const jobTitle = req.query.job || req.body?.job;
  context.log("🔍 jobTitle:", jobTitle);

  if (!jobTitle) {
    context.res = {
      status: 400,
      body: { error: "Missing required 'job' parameter." },
    };
    return;
  }

  try {
    // Get known occupations
    const Labels = db.collection("occupationLabels");
    const occupationLabels = await Labels.find().toArray();
    const knownOccupations = occupationLabels.map((l: any) => l.name);

    // Start thread with assistant
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: jobTitle,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
      tool_choice: "auto",
    });

    // Handle assistant tool call
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      if (runStatus.status === "completed") break;

      if (runStatus.status === "requires_action") {
        const toolCall =
          runStatus.required_action?.submit_tool_outputs?.tool_calls?.[0];

        if (toolCall?.function?.name === "getTasksForJob") {
          const args = JSON.parse(toolCall.function.arguments);

          const outputToAssistant = {
            jobTitle: args.jobTitle,
            knownOccupations,
          };

          await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
            tool_outputs: [
              {
                tool_call_id: toolCall.id,
                output: JSON.stringify(outputToAssistant),
              },
            ],
          });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Retrieve assistant response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const last = messages.data.find((m) => m.role === "assistant");
    const content = last?.content?.[0];

    if (content?.type === "text") {
      try {
        const result = JSON.parse(content.text.value);

        if (!result.found) {
          context.log("❌ No occupation match:", result.reason);
          context.res = {
            status: 200,
            body: result,
          };
          return;
        }

        const occupationName = result.matchedOccupation;
        const considered = result.considered;

        context.log("✅ Occupation match:", occupationName);
        context.log("🔎 Considered:", considered?.join(", ") || "N/A");

        const taskResult = await getTasksForOccupationName(occupationName);

        context.res = {
          status: 200,
          body: taskResult,
        };
      } catch (err) {
        context.log("❗ Error parsing assistant response:", err);
        context.res = {
          status: 200,
          body: {
            found: false,
            reason: "La respuesta del asistente no era un JSON válido.",
          },
        };
      }
    } else {
      context.res = {
        status: 200,
        body: {
          found: false,
          reason: "La respuesta del asistente no tenía el formato esperado.",
        },
      };
    }
  } catch (err: any) {
    context.log.error("💥 Error in IOTaskFinderInDB:", err);
    context.res = {
      status: 500,
      body: { error: "Internal server error", detail: err.message },
    };
  }
};

export default httpTrigger;
