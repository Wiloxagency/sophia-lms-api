import { AzureFunction, Context, HttpRequest } from "@azure/functions";
// import { saveLog } from "../shared/saveLog";
// import OpenAI from "openai";
// import { createAudioWithoutCourse } from "../CreateContent/createAudios";
// import { guidanceMessage, systemPrompt } from "./prompts";
// import { handleToolCall } from "./handleToolCall";
// import { extractFormDataTool } from "./tools";
// import { saveInterview } from "./saveInterview";
// import { mergeFormData } from "./mergeFormData";
// import { createConnection } from "../shared/mongo";
// import { WithId, Document } from "mongodb";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const database = createConnection();

export interface GptFormData {
  name: string | null;
  position: string | null;
  tasks: Record<string, TaskFormData>;
}

export type TaskFormData = {
  frequency?: null | 0 | 1 | 2 | 3 | 4;
  duration: null | 0 | 1 | 2 | 3 | 4;
  difficulty?: null | 0 | 1 | 2;
  addedValue?: null | string;
  implicitPriority?: null | 0 | 1 | 2;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  //   try {
  //     const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  //     const {
  //       messages,
  //       formData,
  //       taskInProgress,
  //       isSpeechEnabled,
  //       userEmail,
  //       sessionId,
  //     } = body || {};
  //     if (!messages || !Array.isArray(messages)) {
  //       context.res = {
  //         status: 400,
  //         body: { message: "Missing or invalid 'messages' array" },
  //       };
  //       return;
  //     }
  //     if (!userEmail || !sessionId) {
  //       context.res = {
  //         status: 400,
  //         body: { message: "Missing userEmail or sessionId" },
  //       };
  //       return;
  //     }
  //     const contextInjection = {
  //       role: "user",
  //       content: taskInProgress
  //         ? `Datos actuales para la tarea "${taskInProgress}": ${JSON.stringify(
  //             formData || {}
  //           )}`
  //         : "Aún no se ha definido una tarea. Por favor, ayuda al usuario a definir una tarea antes de hacer preguntas sobre frecuencia, dificultad, etc.",
  //     };
  //     const messageChain = [
  //       systemPrompt,
  //       guidanceMessage,
  //       contextInjection,
  //       ...messages,
  //     ];
  //     const response = await openai.chat.completions.create({
  //       model: "gpt-4-0125-preview",
  //       messages: messageChain,
  //       temperature: 0.7,
  //       tools: [extractFormDataTool],
  //       tool_choice: "auto",
  //     });
  //     const choice = response.choices[0];
  //     const assistantMessage = choice.message;
  //     const toolCall = assistantMessage?.tool_calls?.[0];
  //     const messageHistory = [...messageChain];
  //     let formDataUpdate = null;
  //     let followUpContent = assistantMessage?.content || "";
  //     if (
  //       choice.finish_reason === "tool_calls" &&
  //       toolCall?.function?.name === "extract_form_data"
  //     ) {
  //       const result = await handleToolCall({
  //         choice,
  //         toolCall,
  //         messageHistory,
  //         openai,
  //         taskInProgress,
  //       });
  //       formDataUpdate = result.formDataUpdate;
  //       followUpContent = result.followUpContent;
  //     }
  //     const db = await database;
  //     const Interview = db.collection("Interview");
  //     let existingData = (await Interview.findOne({ userEmail, sessionId })) as
  //       | (WithId<Document> & { formData: GptFormData })
  //       | null;
  //     if (!existingData) {
  //       existingData = {
  //         userEmail,
  //         sessionId,
  //         formData: {
  //           name: null,
  //           position: null,
  //           tasks: {},
  //         },
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //       } as any; // Temporary: safe because we control the structure
  //     }
  //     // Defensive default if bot hasn't extracted anything yet
  //     const mergedFormData = mergeFormData(
  //       existingData.formData,
  //       formDataUpdate || {}
  //     );
  //     await saveInterview(userEmail, mergedFormData, sessionId);
  //     let audioUrl = null;
  //     if (isSpeechEnabled && followUpContent) {
  //       const voice = "DaliaNeural";
  //       const language = "es-MX";
  //       const audioResponse = await createAudioWithoutCourse(
  //         followUpContent,
  //         voice,
  //         language
  //       );
  //       audioUrl = audioResponse.url;
  //     }
  //     context.res = {
  //       status: 200,
  //       headers: { "Content-Type": "application/json" },
  //       body: {
  //         message: followUpContent,
  //         audioUrl,
  //         formDataUpdate,
  //         messageHistory,
  //       },
  //     };
  //   } catch (error: any) {
  //     await saveLog(
  //       `Error creating Chat Completion: ${error.message}`,
  //       "Error",
  //       "AzureFunction()",
  //       "IOGpt"
  //     );
  //     context.res = {
  //       status: 500,
  //       headers: { "Content-Type": "application/json" },
  //       body: { message: "Error generating response" },
  //     };
  //   }
};

export default httpTrigger;
