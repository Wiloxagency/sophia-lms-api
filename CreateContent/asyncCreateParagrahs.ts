import {
  conclusionGeneration,
  contentGeneration,
  introductionGeneration,
} from "./prompts";
import { saveLog } from "../shared/saveLog";
import { extraWords } from "../Language/extrawords";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
import { createConnection } from "../shared/mongo";
import { Payload } from "./interfaces";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const database = createConnection()

export function cleanText(text: string): string {
  return text
    .trimStart()
    .replace(/\n\s*\n/g, "\n")
    .replace(/  +/g, " ")
    .replace(/^ +/gm, "")
    .replace(/(?<=[a-z])\s?\n/, ". ")
    .replace(/\*/g, "")
    .replace(/\#/g, "")
    .replace(/"/g, "");
}

function splitParagraphByThreshold(text: string): string[] {
  let out: string[] = [];
  let threshold = 400;
  let numItems = 0;

  text
    .trim()
    .split(".")
    .forEach((chunk) => {
      if (numItems > 0) {
        if (chunk.length + out[numItems - 1].length < threshold) {
          if (chunk.trim().length > 0) {
            out[numItems - 1] += " " + chunk.trim() + ".";
          }
        } else {
          out.push(chunk.trim() + ".");
          numItems++;
        }
      } else {
        out.push(chunk.trim() + ".");
        numItems++;
      }
    });
  return out;
}

export function splitParagraphs(text: string, autoBreak: boolean): string[] {
  let validParagraphs = text.split("\n").filter((p) => {
    return p.length >= 50;
  });
  let paragraphs: string[] = [];

  validParagraphs.forEach((validParagraph) => {
    if (autoBreak) {
      splitParagraphByThreshold(validParagraph).forEach((p) => {
        paragraphs.push(p.replace(/\n/g, ""));
      });
    } else {
      paragraphs.push(validParagraph.replace(/\n/g, ""));
    }
  });
  return paragraphs.filter((p) => {
    return p.trim().length >= 2;
  });
}

export async function asyncCreateParagraphs(
  courseCode: string,
  courseName: string,
  courseStructure: string[],
  languageName: string,
  languageIso: string,
  voice: string,
  assetsSource: string,
  sectionTitle: string,
  sectionIndex: number,
  elementIndex: number,
  elementTitle?: string

) {

  const db = await database

  // If its a lesson will use elementTitle instead sectionTitle
  sectionTitle = elementTitle ? elementTitle : sectionTitle
  const languageShortIso = languageIso.split("-")[0];
  let formattedCourseName = courseName
    .replace(/curso de/gi, "")
    .replace(/curso/gi, "")
    .trim();

  const formattedSectionTitle: string = sectionTitle
    .replace(/curso de/gi, "")
    .replace(/curso/gi, "")
    .replace(/\.+$/, "")
    .trim();


  const promptCourseStructure = courseStructure
    .map((tableItem: string, idx: number) => {
      return `Item ${idx + 1}: ${tableItem.trim()}\n`;
    })
    .join("\n");

  let formattedText = formattedSectionTitle.replace(/\.+$/, "");

  const typeDetected = extraWords.filter((extraWord) => {
    return extraWord.lang == languageShortIso;
  })[0];


  const introductionFound =
    typeDetected.Introduction.filter((introductionWord) => {
      return formattedText.indexOf(introductionWord) === 0;
    }).length > 0;
  console.info("introductionFound-->", introductionFound);

  const conclusionFound =
    typeDetected.Conclusion.filter((conclusionWord) => {
      return formattedText.indexOf(conclusionWord) === 0;
    }).length > 0;
  console.info("conclusionFound-->", conclusionFound);

  const contentType = introductionFound
    ? "Introduction"
    : conclusionFound
      ? "Conclusion"
      : "Normal";
  let prompt = "";

  switch (contentType) {
    case "Introduction":
      prompt = introductionGeneration.prompt;
      break;

    case "Conclusion":
      prompt = conclusionGeneration.prompt;
      break;

    default:
      prompt = contentGeneration.prompt;
      break;
  }

  prompt = prompt
    .replace(/v{courseName}/g, formattedCourseName)
    .replace(/v{languageName}/g, languageName)
    .replace(/v{text}/g, formattedText)
    .replace(/v{promptCourseStructure}/g, promptCourseStructure);



  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: contentGeneration.role,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    updateCourseTokens(
      courseCode,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );

    let data = response.choices[0].message.content.trim();

    const formattedData =
      data.charAt(0).toUpperCase() + data.slice(1);
    const paragraphs = splitParagraphs(formattedData, true);

    const cleanParagraphs = paragraphs.map((paragraph) => {
      return cleanText(paragraph);
    });

    let date = new Date()

    let payloads = []
    let courseParagraphs = []
    cleanParagraphs.forEach((paragraph: string, slideIndex: number) => {
      let payload: Payload = {
        timestamp: date,
        courseName: courseName,
        courseCode: courseCode,
        sectionIndex: sectionIndex,
        elementIndex: elementIndex,
        slideIndex: slideIndex,
        paragraph: paragraph,
        language: languageIso,
        voice: voice,
        ttsStatus: "waiting",
        titleStatus: "waiting",
      }

      switch (assetsSource) {

        case 'openai':

          payload = {
            ...payload,
            promptStatus: "waiting",
            dalleStatus: "waiting-prompt",
            prompts: []
          };

          break;

        case 'vecteezy':

          payload = {
            ...payload,
            assetStatus: "waiting",

          };

        case 'pexels':

          payload = {
            ...payload,
            pexelsStatus: "waiting",

          };

        default:
          break;
      }
      let courseParagraph = {

        "content": paragraph,
        "audioScript": paragraph,
        "imageData": {
          "finalImage": {
            "url": null,
            "width": 0,
            "height": 0
          },
        },
        "videoData": {
          "thumb": {
            "url": "",
            "width": 0,
            "height": 0
          },
          "finalVideo": {
            "url": "",
            "width": 0,
            "height": 0
          }
        }
      }

      payloads.push(payload)
      courseParagraphs.push(courseParagraph)
    });


    const slide = db.collection("slide")
    await slide.insertMany(payloads)

    let paragraphsArrayPath =
      `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs`;

    await db.collection("course").findOneAndUpdate(
      { code: courseCode },
      {
        $set: {
          [paragraphsArrayPath]: courseParagraphs
        },
      }
    );

  } catch (error) {
    await saveLog(
      `Error: ${error.message} creating Paragraph for course: ${courseCode}.`,
      "Error",
      "asyncCreateParagraphs()",
      "Courses/{courseCode}/CreateContent"
    );
    console.error(error);

  }
}
