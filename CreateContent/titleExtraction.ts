import { titleExtraction } from "./gpt3.prompt";
import { saveLog } from "../shared/saveLog";
import { searchImages, searchImagesGpt3 } from "./prompts";
import OpenAI from "openai";

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
    // const response = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     messages: [
    //         {
    //             role: "system",
    //             content: "Software developer"
    //         },
    //         {
    //             role: "user",
    //             content: prompt
    //         }
    //     ]

    // })
    // let data = response.data.choices[0].message.content
    // console.info("gptSearchImages response -->",data)
    // const obj = JSON.parse(data)

    const titleAIObj = await openai.completions.create({
      model: "gpt-3.5-turbo-16k",
      prompt: prompt,
      temperature: 0.2,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    const mainPhrase = titleAIObj.choices[0].text
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
