import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
import { createConnection } from "../shared/mongo";
import { Db } from "mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const database = createConnection()

// TODO -> Definir como variable de entorno
const openAIModelLimit = 9500

export async function createDallePrompt(
  currentItem: any, db: Db
): Promise<string> {


  // const prompt =
  //   `In the context of a course called: ${currentItem.courseName}, what prompt in english for generating a High-resolution photo using DALL·E-3 would you recommend for a slide with the following text content:\n` + 
  //   `"${currentItem.paragraph}"\n` + 
  //   "In case of including people, they are only Westerners.\n" + 
  //   "Do not make any comments before or after the prompt."


  // console.info("Prompt:", prompt);

  // const prompt =
  // `In the context of a course called: ${currentItem.courseName}, what prompt in English for generating a realistic, high-resolution photo using DALL·E-3 would you recommend for a slide with the following text content:\n` + 
  // `"${currentItem.paragraph}"\n` + 
  // "Ensure the photo appears to be captured with a conventional DSLR camera, using natural lighting, and a candid, unposed style. If including people, limit them to a small group (1-3) of Western individuals in the scene to maintain a natural and realistic atmosphere. Avoid overcrowding or futuristic elements.\n" + 
  // "Do not make any comments before or after the prompt.";

  const prompt =
  `In the context of a course called: ${currentItem.courseName}, what prompt in English for generating a realistic, high-resolution photo using DALL·E-3 would you recommend for a slide with the following text content:\n` + 
  `"${currentItem.paragraph}"\n` + 
  "Ensure the photo appears to be captured with a conventional DSLR camera, using natural lighting, and a candid, unposed style. If including people, limit them to a small group (1-3) of Western individuals. Emphasize that the individuals should appear as realistic as possible, resembling actual photographs with natural skin tones, facial features, and clothing. Avoid any 3D or illustrated look, and focus on creating a lifelike, authentic representation.\n" + 
  "Do not make any comments before or after the prompt."

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

    updateCourseTokens(currentItem.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

    // console.info(response.choices[0].message.content.trim());
    const generatedPrompt = response.choices[0].message.content
      .trim()
      .replace(/"/g, "")


    console.info("prompt:", generatedPrompt);

    try {
      await db.collection("slide").updateOne(
        { _id: currentItem._id },
        {
          $set: { promptStatus: "created", dalleStatus: "waiting" },
          $push: { prompts: generatedPrompt }
        }
      );
      // AsyncDalleImgCycle()

    } catch (error) {
      
      console.error("Fatal error", error)
    }
    //

    return "ok";
  } catch (error) {
    await saveLog(
      `Error creating Dalle-3 prompt for course: ${currentItem.courseCode}.`,
      "Error",
      "createDallePrompt()",
      "Courses/{courseCode}/CreateContent"
    );
    return undefined;
  }
}

export async function AsyncPromptCycle() {

  console.info('AsyncPromptCycle function ran at:' + new Date().toISOString());

  const db = await database
  const slide = db.collection("slide")

  const slidesInList = await slide
    .find({ "promptStatus": "waiting" })
    .sort({ "timestamp": 1 })
    .limit(openAIModelLimit)
    .toArray();

  if (slidesInList.length <= 0)
    return

  const idsToUpdate = slidesInList.map(slide => slide._id);

  await slide.updateMany(
    { _id: { $in: idsToUpdate } },
    { $set: { promptStatus: "processing" } }
  );

  slidesInList.forEach(element => {
    createDallePrompt(element, db)
  })


}
