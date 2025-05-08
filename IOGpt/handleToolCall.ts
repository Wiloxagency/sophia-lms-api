import OpenAI from "openai";
import { extractFormData } from "./extractFormData";

export async function handleToolCall({
  choice,
  toolCall,
  messageHistory,
  openai,
  taskInProgress,
}: {
  choice: any;
  toolCall: any;
  messageHistory: any[];
  openai: OpenAI;
  taskInProgress: string;
}) {
  let formDataUpdate = null;
  let identityUpdate = null;
  let followUpContent = choice.message?.content || "";

  if (
    choice.finish_reason === "tool_calls" &&
    toolCall?.function?.name === "extract_form_data"
  ) {
    console.log("TOOL CALL");

    const argsRaw = toolCall.function.arguments;

    try {
      ({ identityUpdate, formDataUpdate } = extractFormData(argsRaw));
    } catch {
      try {
        const decoded = Buffer.from(argsRaw, "latin1").toString("utf8");
        ({ identityUpdate, formDataUpdate } = extractFormData(decoded));
      } catch (err) {
        console.error("Failed to parse tool call arguments:", err);
      }
    }

    messageHistory.push({
      role: "assistant",
      tool_calls: [toolCall],
    });

    messageHistory.push({
      tool_call_id: toolCall.id,
      role: "tool",
      name: "extract_form_data",
      content: JSON.stringify({ status: "ok" }),
    });

    const followUp = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [...messageHistory],
      temperature: 0.7,
    });

    const followUpMessage = followUp.choices[0]?.message;
    followUpContent = followUpMessage?.content || "";

    if (followUpMessage) {
      messageHistory.push(followUpMessage);
    }
  }

  return {
    formDataUpdate: {
      name: identityUpdate?.name ?? undefined,
      position: identityUpdate?.position ?? undefined,
      tasks: formDataUpdate,
    },
    followUpContent,
  };
}
