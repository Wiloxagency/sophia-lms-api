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
    const { messages, formData, taskInProgress, isSpeechEnabled } =
      req.body || {};
    console.log("isSpeechEnabled:", isSpeechEnabled);

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
      Eres un asistente conversacional diseñado para llevar a cabo entrevistas de productividad con empleados.
      
      Objetivo: conocer a fondo las tareas diarias del entrevistado para identificar posibles mejoras en productividad — por ejemplo, con herramientas de automatización o inteligencia artificial.
      
      Tu tono debe ser profesional y empático, transmitiendo que la información será usada exclusivamente para análisis interno.
      
      Comienza la conversación saludando y explicando brevemente el propósito de la entrevista. Luego, guía al usuario para que describa una tarea que realiza frecuentemente. Aún no hagas preguntas sobre frecuencia, dificultad u otros detalles hasta que la tarea haya sido definida.
      
      Cuando tengas toda la información sobre la tarea (frecuencia y tiempo, dificultad, valor agregado, y priorización implícita), concluye con un resumen claro y pregunta si hay otra tarea que el usuario quiera analizar.`,
    };

    const contextInjection = taskInProgress
      ? {
          role: "user",
          content: `Datos actuales para la tarea "${taskInProgress}": ${JSON.stringify(
            formData || {}
          )}`,
        }
      : {
          role: "user",
          content:
            "Aún no se ha definido una tarea. Por favor, ayuda al usuario a definir una tarea antes de hacer preguntas sobre frecuencia, dificultad, etc.",
        };

    const messageChain = [
      systemPrompt,
      ...(contextInjection ? [contextInjection] : []),
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: messageChain,
      temperature: 0.7,
    });

    const messageContent = response.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("OpenAI response did not contain message content");
    }

    // Optionally generate audio
    let audioUrl = null;
    if (isSpeechEnabled) {
      const voice = "DaliaNeural";
      const language = "es-MX";
      const audioResponse = await createAudioWithoutCourse(
        messageContent,
        voice,
        language
      );
      audioUrl = audioResponse.url;
    }

    // Response (optional: parse formDataUpdate later)
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        message: messageContent,
        audioUrl,
        formDataUpdate: null, // To be implemented
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
