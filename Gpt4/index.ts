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
    const { messages, isSpeechEnabled } = req.body || {};
    console.log(" isSpeechEnabled: ", isSpeechEnabled)

    if (!messages || !Array.isArray(messages)) {
      context.res = {
        status: 400,
        body: { message: "Missing or invalid 'messages' array" },
      };
      return;
    }

    const systemPrompt = {
      role: "system",
      content: "Eres un asistente útil que responde en español.",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [systemPrompt, ...messages],
    });

    const messageContent = response.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("OpenAI response did not contain message content");
    }

    // If speech is enabled, generate audio
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

    // Return the response with text and audio URL (if generated)
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { message: messageContent, audioUrl },
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
