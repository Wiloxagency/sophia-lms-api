import { contentTable } from "./prompts";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createContentTable(
  courseName: string,
  maxSections: number,
  languageName: string,
  courseCode: string,
  courseDescription: string
): Promise<string[]> {
  const prompt = contentTable.prompt
    .replace(/v{maxSections}/g, maxSections.toString())
    .replace(/v{courseName}/g, courseName)
    .replace(/v{languageName}/g, languageName)
    .replace(/v{courseDescription}/g, courseDescription);

  console.info("Prompt:", prompt);

  try {
    // const response = await openai.createCompletion({
    //     model: "text-davinci-003",
    //     prompt: prompt,
    //     temperature: 0.7,
    //     max_tokens: 2500,
    //     top_p: 1,
    //     frequency_penalty: 0,
    //     presence_penalty: 0,
    // })

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: contentTable.role,
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "system",
          content: contentTable.resp,
        },
      ],
    });

    console.info(response.choices[0].message.content.trim());
    let splittedcontentTable = response.choices[0].message.content
      .trim()
      .replace(/\d{1,2}\./g, "")
      .split("\n")
      .map((item) => {
        return item.trim();
      })
      .filter((item) => {
        return item.length > 1;
      });

    console.info("splittedcontentTable:", splittedcontentTable);

    return splittedcontentTable;
  } catch (error) {
    await saveLog(
      `Error creating Content Table for course: ${courseCode}.`,
      "Error",
      "createContentTable()",
      "Courses/{courseCode}/CreateContent"
    );
    return undefined;
  }
}
