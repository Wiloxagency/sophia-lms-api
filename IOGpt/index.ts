import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { createAudioWithoutCourse } from "../CreateContent/createAudios";
import { guidanceMessage, systemPrompt } from "./prompts";
import { handleToolCall } from "./handleToolCall";
import { extractFormDataTool } from "./tools";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { messages, formData, taskInProgress, isSpeechEnabled } = body || {};

    if (!messages || !Array.isArray(messages)) {
      context.res = {
        status: 400,
        body: { message: "Missing or invalid 'messages' array" },
      };
      return;
    }

    const contextInjection = {
      role: "user",
      content: taskInProgress
        ? `Datos actuales para la tarea "${taskInProgress}": ${JSON.stringify(
            formData || {}
          )}`
        : "Aún no se ha definido una tarea. Por favor, ayuda al usuario a definir una tarea antes de hacer preguntas sobre frecuencia, dificultad, etc.",
    };

    const messageChain = [
      systemPrompt,
      guidanceMessage,
      contextInjection,
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: messageChain,
      temperature: 0.7,
      tools: [extractFormDataTool],
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    const toolCall = assistantMessage?.tool_calls?.[0];
    const messageHistory = [...messageChain];

    let formDataUpdate = null;
    let identityUpdate = null;
    let followUpContent = assistantMessage?.content || "";

    if (
      choice.finish_reason === "tool_calls" &&
      toolCall?.function?.name === "extract_form_data"
    ) {
      ({ formDataUpdate, identityUpdate, followUpContent } =
        await handleToolCall({
          choice,
          toolCall,
          messageHistory,
          openai,
        }));
    }

    let audioUrl = null;
    if (isSpeechEnabled && followUpContent) {
      const voice = "DaliaNeural";
      const language = "es-MX";
      const audioResponse = await createAudioWithoutCourse(
        followUpContent,
        voice,
        language
      );
      audioUrl = audioResponse.url;
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        message: followUpContent,
        audioUrl,
        formDataUpdate,
        identityUpdate,
        messageHistory,
      },
    };
  } catch (error: any) {
    await saveLog(
      `Error creating Chat Completion: ${error.message}`,
      "Error",
      "AzureFunction()",
      "GPT"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { message: "Error generating response" },
    };
  }
};

export default httpTrigger;
