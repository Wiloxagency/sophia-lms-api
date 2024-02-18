import { saveLog } from "../shared/saveLog";
import { keyphrases } from "./prompts";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createkeyphrases(
  text: string,
  languageName: string,
  courseCode: string
): Promise<string[]> {
  const prompt = keyphrases
    .replace(/v{text}/g, text.trim())
    .replace(/v{languageName}/g, languageName.trim());

  //console.info("Keyphrases prompt -->", prompt)

  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-16k",
      prompt: prompt,
      temperature: 0,
      max_tokens: 250,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
    });

    const keywords = response.choices[0].text
      .split(",")
      .map((item) => {
        return item
          .trim()
          .replace(/- /, "")
          .replace(/-/, "")
          .replace(/\.$/, "");
      })
      .filter((item) => {
        return item.trim().length > 1;
      });
    return keywords;
  } catch (error) {
    await saveLog(
      `Error creating keyphrases in course: ${courseCode}.`,
      "Error",
      "createkeyphrases()",
      "Courses/{courseCode}/CreateContent"
    );
    console.error(error);
    return undefined;
  }
}
