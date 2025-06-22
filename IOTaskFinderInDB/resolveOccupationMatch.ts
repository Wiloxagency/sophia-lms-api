import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ASSISTANT_ID =
  process.env.TASKFINDER_ASSISTANT_ID_IN_DB || "asst_RQXhWlUReYXwnG18bHQpZFBD";

interface AssistantTextJson {
  found: boolean;
  matchedOccupation?: string;
  considered?: string[];
  reason?: string;
}

export async function resolveOccupationMatch(
  jobTitle: string,
  knownOccupations: string[]
): Promise<
  | { found: true; matchedOccupation: string; considered: string[] }
  | { found: false; reason: string }
> {
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: jobTitle,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: ASSISTANT_ID,
    tool_choice: "auto",
  });

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
        const { jobTitle: inputTitle } = args;

        const outputToAssistant = {
          jobTitle: inputTitle,
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

  const messages = await openai.beta.threads.messages.list(thread.id);
  const last = messages.data.find((m) => m.role === "assistant");
  const content = last?.content?.[0];

  console.log(" content: ", content);

  if (content?.type === "text") {
    try {
      let raw = content.text.value.trim();

      // 🔧 Strip triple backticks if needed
      if (raw.startsWith("```")) {
        raw = raw
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/```$/, "")
          .trim();
      }

      const parsed = JSON.parse(raw) as AssistantTextJson;
      console.log("🧠 Assistant parsed response:", parsed);

      if (!parsed.found || !parsed.matchedOccupation) {
        return {
          found: false,
          reason: "La respuesta no contenía una ocupación válida.",
        };
      }

      return {
        found: true,
        matchedOccupation: parsed.matchedOccupation,
        considered: parsed.considered ?? [parsed.matchedOccupation],
      };
    } catch (err) {
      console.error("❌ Error parsing assistant response:", err);
      return {
        found: false,
        reason: "No se pudo interpretar la respuesta del asistente.",
      };
    }
  }

  return {
    found: false,
    reason: "La respuesta del asistente no tenía el formato esperado.",
  };
}
