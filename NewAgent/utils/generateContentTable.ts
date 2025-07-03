import OpenAI from "openai";
import { CourseData } from "../../shared/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateContentTable(
  fileIds: string[],
  course: CourseData,
  languageName: string,
  maxSections: string
): Promise<{ sectionTitle: string; sectionContent: string }[]> {
  const assistantId = "asst_ioyW0EqK0BeCORRCmJRDC8dA";

  const thread = await client.beta.threads.create();

  const prompt = `
Use the file search tool to analyze the attached PDF and generate a table of contents with relevant content extracted from the file for each section.

- Write in ${languageName}, with a maximum of ${maxSections} sections.
- Only include sections that are clearly supported by the file search results.
- Start with an introduction and end with a conclusion, only if supported.
- Do not hallucinate or guess any content.
- Respond only in JSON format as an array of objects with the following structure:

[
  {
    "sectionTitle": "Introduction",
    "sectionContent": "..."
  },
  {
    "sectionTitle": "Section 1 Title",
    "sectionContent": "..."
  },
  ...
]

Return only valid JSON. Do not include any commentary, explanation, or markdown formatting.`;

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

  try {
    const sections: { sectionTitle: string; sectionContent: string }[] =
      JSON.parse(textContent);
    return sections;
  } catch (e) {
    console.error("Failed to parse assistant response:", textContent);
    throw new Error("Assistant did not return valid JSON.");
  }
}
