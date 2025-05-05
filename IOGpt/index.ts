import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { createAudioWithoutCourse } from "../CreateContent/createAudios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      context.res = { status: 400, body: { message: "Invalid JSON body" } };
      return;
    }

    const { messages, formData, taskInProgress, isSpeechEnabled } = body || {};

    if (!messages || !Array.isArray(messages)) {
      context.res = {
        status: 400,
        body: { message: "Missing or invalid 'messages' array" },
      };
      return;
    }

    const systemPrompt = {
      role: "system",
      content: `
Eres un asistente diseñado para realizar entrevistas de productividad.

Primero, saluda al usuario y explícale brevemente el propósito de la entrevista: conocer mejor su rol y tareas para identificar oportunidades de mejora en su productividad, por ejemplo usando inteligencia artificial.

Asegúrate de recolectar primero su nombre y su cargo actual en la empresa. Luego puedes pasar a explorar tareas específicas.

Cuando la información de una tarea esté completa (frecuencia y tiempo, dificultad, valor agregado, priorización implícita), haz un resumen y pregunta si desea analizar otra tarea.

Mantén siempre un tono amable y profesional.`,
    };

    const guidanceMessage = {
      role: "user",
      content:
        "Por favor, si detectas información relevante del usuario o de sus tareas, llama a la herramienta 'extract_form_data' con los valores detectados.",
    };

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
      tools: [
        {
          type: "function",
          function: {
            name: "extract_form_data",
            description: "Extrae información estructurada de la entrevista",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nombre del usuario" },
                position: { type: "string", description: "Cargo del usuario" },
                frequencyAndTime: { type: "string" },
                difficulty: { type: "string" },
                addedValue: { type: "string" },
                implicitPriority: { type: "string" },
              },
              required: [],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    const toolCall = assistantMessage?.tool_calls?.[0];

    console.log("message: ", assistantMessage);

    let formDataUpdate = null;
    let followUpContent = assistantMessage?.content || "";
    const messageHistory = [...messageChain];

    if (
      choice.finish_reason === "tool_calls" &&
      toolCall?.function?.name === "extract_form_data"
    ) {
      console.log("TOOL CALL");

      const argsRaw = toolCall.function.arguments;
      try {
        formDataUpdate =
          typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
      } catch {
        try {
          const decoded = Buffer.from(argsRaw, "latin1").toString("utf8");
          formDataUpdate = JSON.parse(decoded);
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
