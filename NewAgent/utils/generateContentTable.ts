import OpenAI from "openai";
import { CourseData } from "../../shared/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateContentTable(
  fileIds: string[],
  course: CourseData,
  languageName: string,
  maxSections: string
): Promise<string[]> {
  // const assistant = await client.beta.assistants.create({
  //   name: "Content Table Generator",
  //   instructions: `You're an expert in analyzing course material and creating well-structured tables of contents.`,
  //   model: "gpt-4o",
  //   tools: [{ type: "file_search" }],
  // });
  const assistantId = "asst_ioyW0EqK0BeCORRCmJRDC8dA";

  const thread = await client.beta.threads.create();

  const prompt = `Analyze the attached documents and create a table of contents based on their content. Write it in ${languageName}, with exactly ${maxSections} items.\nThe first item should be the introduction of the course and the last item should be the conclusion.\nWrite that table of contents in the following format:\n\n1. Introduction.\n2. Item 2.\n3. Item 3.\n...\n${maxSections}. Conclusion.\n\nDon't write any text before the introduction (item 1) and after the Conclusion (item ${maxSections}) — only write the content table without any additional description. IMPORTANT: Only generate content that is directly supported by the information in the attached documents. If the content is not found in the provided files, do not include it.`;

  await client.beta.threads.messages.create(thread.id, {
    role: "user",
    content: prompt,
    attachments: fileIds.map((file_id) => ({
      file_id,
      tools: [{ type: "file_search" }],
    })),
  });

  const run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  // Poll for completion
  let runStatus = run.status;
  while (runStatus === "queued" || runStatus === "in_progress") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updatedRun = await client.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    runStatus = updatedRun.status;
  }

  if (runStatus !== "completed") {
    throw new Error(`Run failed with status: ${runStatus}`);
  }

  const messages = await client.beta.threads.messages.list(thread.id);
  const assistantMessage = messages.data.find(
    (msg) => msg.role === "assistant"
  );

  if (!assistantMessage) {
    throw new Error("No assistant message found in response.");
  }

  const textContent = assistantMessage.content
    .map((part) => (part.type === "text" ? part.text.value : ""))
    .join("\n");

  return textContent.split("\n").filter((line) => line.trim());
}
