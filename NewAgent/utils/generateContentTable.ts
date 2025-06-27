import OpenAI from "openai";
import { CourseData } from "../../shared/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateContentTable(
  fileIds: string[],
  course: CourseData,
  languageName: string,
  maxSections: string
): Promise<string[]> {
  const assistantId = "asst_ioyW0EqK0BeCORRCmJRDC8dA";

  const thread = await client.beta.threads.create();

  const prompt = `
Use the file search tool to analyze the attached PDF and generate a table of contents based on its content.

- Write in ${languageName}, with a maximum of ${maxSections} sections.
- Only include sections that are clearly supported by the file search results.
- Start with an introduction and end with a conclusion, only if supported.
- Do not hallucinate or guess any content.
- Respond with a numbered list only — no extra commentary.

Write the table of contents in the following format:

1. Introduction.
2. Title of section 2.
3. Title of section 3.
...
n. Conclusion.

Only return the list. Do not include any explanation before or after the list.`;

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

  // const steps = await client.beta.threads.runs.steps.list(thread.id, run.id);
  // console.log(JSON.stringify(steps.data, null, 2));

  const messages = await client.beta.threads.messages.list(thread.id);
  messages.data.forEach((m) => console.log(JSON.stringify(m, null, 2)));
  const assistantMsg = messages.data.find((m) => m.role === "assistant");

  if (assistantMsg?.attachments?.length === 0) {
    console.warn("⚠️ Assistant did not reference any file passages.");
  }
  const assistantMessage = messages.data.find(
    (msg) => msg.role === "assistant"
  );

  if (!assistantMessage) {
    throw new Error("No assistant message found in response.");
  }

  const textContent = assistantMessage.content
    .map((part) => (part.type === "text" ? part.text.value : ""))
    .join("\n");

  console.log(JSON.stringify(assistantMessage, null, 2));

  return textContent.split("\n").filter((line) => line.trim());
}
