import { titleExtraction } from "./gpt3.prompt";
import { saveLog } from "../shared/saveLog";
import { searchImages, searchImagesGpt3 } from "./prompts";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptSearchImages = searchImages;
const gpt3SearchImages = searchImagesGpt3;

export async function extractTitle(
  paragraphContent: string,
  sectionTitle: string,
  languageName: string,
  courseTitle: string,
  courseCode: string
): Promise<{ title: string }> {
  const prompt = gpt3SearchImages
    .replace(/v{languageName}/g, languageName.trim())
    .replace(/v{courseName}/g, courseTitle.trim())
    .replace(/v{sectionTitle}/g, sectionTitle.trim())
    .replace(/v{paragraphContent}/g, paragraphContent.trim());

  //console.info("gptSearchImages prompt -->", prompt)

  // const prompt = titleExtraction["es"]["prompt"].
  //     replace(/v{text}/g, paragraphContent)
  // let titleAIObj: any
  // let mainPhrase: string = ""

  try {
    const titleAIObj = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    updateCourseTokens(courseCode, titleAIObj.usage.prompt_tokens, titleAIObj.usage.completion_tokens);

    const mainPhrase = titleAIObj.choices[0].message.content
      .replace(/[\r\n]/gm, "")
      .trim();

    const title =
      mainPhrase && mainPhrase.length > 0
        ? mainPhrase
        : courseTitle.trim() + " " + sectionTitle.trim();

    return { title: title };
  } catch (error) {
    await saveLog(
      `Error trying to extract a title for course: ${courseCode}. Error: ${error.message}`,
      "Error",
      "extractTitle()",
      "Courses/{courseCode}/CreateContent"
    );
    return { title: "" };
  }
}
