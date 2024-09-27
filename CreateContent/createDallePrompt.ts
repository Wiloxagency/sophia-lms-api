import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
import { createConnection } from "../shared/mongo";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const database = createConnection()

export async function createDallePrompt(
  courseName: string,
  courseCode: string,
  paragraph: string,
  sectionIndex: number,
  elementIndex: number,
  slideIndex: number
): Promise<string> {

  const prompt =
    `In the context of a course called: ${courseName}, 
  what prompt in english for generating a High-resolution photo using DALL·E-3 would you recommend for a slide with the following text content:
  ${paragraph}`

  console.info("Prompt:", prompt);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a prompt engineer",
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "system",
          content: "The recomended prompt is:",
        },
      ],
    });

    updateCourseTokens(courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

    // console.info(response.choices[0].message.content.trim());
    const generatedPrompt = response.choices[0].message.content
      .trim()
      .replace(/"/g, "")


    console.info("prompt:", generatedPrompt);

    let date = new Date()
    const logPayload = {
      timestamp: date,
      courseName: courseName,
      courseCode: courseCode,
      sectionIndex: sectionIndex,
      elementIndex: elementIndex,
      slideIndex: slideIndex,
      status: "started",
      prompt: generatedPrompt,
      url: null
    }

    try {
      const db = await database
      const dallePrompt = db.collection("dallePrompt")

      await dallePrompt.insertOne(logPayload)
    } catch (error) {
      console.error("Fatal error", error)
    }
    //

    return "ok";
  } catch (error) {
    await saveLog(
      `Error creating Dalle-3 prompt for course: ${courseCode}.`,
      "Error",
      "createDallePrompt()",
      "Courses/{courseCode}/CreateContent"
    );
    return undefined;
  }
}
