import {
  conclusionGeneration,
  contentGeneration,
  introductionGeneration,
  /*     ,
        introductionGeneration,
        conclusionsGeneration */
} from "./prompts";
import { paragraphCreation } from "../interfaces/paragraph";
import { saveLog } from "../shared/saveLog";
import { extraWords } from "../Language/extrawords";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
// import { cleanText } from "./cycle";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

function splitParagraphs(text: string, autoBreak: boolean): string[] {
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

export async function createParagraphs(
  payload: paragraphCreation
): Promise<{ content: string[]; sectionIndex: number }> {
  //console.info("createParagraphs/payload-->", payload)
  const languageName = payload.languageName;
  const languageShortIso = payload.language.split("-")[0];
  let context = payload.context
    .replace(/curso de/gi, "")
    .replace(/curso/gi, "")
    .trim();
  const key = payload.key
    .replace(/curso de/gi, "")
    .replace(/curso/gi, "")
    .trim();
  const text: string = payload.text
    .replace(/curso de/gi, "")
    .replace(/curso/gi, "")
    .trim();
  const index = payload.index;

  // const courseStructure = payload.courseStructure.map((tableItem: string, idx: number) => {
  //     return `${tableItem.trim()}\n`
  // }).join("\n")

  const promptCourseStructure = payload.courseStructure
    .map((tableItem: string, idx: number) => {
      return `Item ${idx + 1}: ${tableItem.trim()}\n`;
    })
    .join("\n");

  const numSection = payload.courseStructure
    .map((item: string) => {
      return item.trim();
    })
    .indexOf(payload.text.trim());

  const notInclude = payload.courseStructure
    .filter((tableItem: string, idx: number) => {
      return idx != numSection;
    })
    .map((tableItem: string, idx: number) => {
      return `Do not include: ${tableItem.trim()}\n`;
    })
    .join("\n");

  const maxParagraphs = payload.maxParagraphs;
  if (context.length < 3) {
    context = text;
  }
  //let prompt = ""

  let formattedText = text.replace(/\.+$/, "");

  // if (introductionGeneration[payload.language]["matches"].includes(formattedText.toLowerCase())) {
  //     prompt = introductionGeneration[payload.language]["prompt"].
  //         replace(/v{context}/g, context)
  // } else if (conclusionsGeneration[payload.language]["matches"].includes(formattedText.toLowerCase())) {
  //     prompt = conclusionsGeneration[payload.language]["prompt"].
  //         replace(/v{context}/g, context)
  // } else {
  // let age = ""
  // if (payload.options && payload.options != null) {
  //     age = contentGeneration[payload.language]["age"].
  //         replace(/v{courseLevel}/g, payload.options.courseLevel).
  //         replace(/v{fromAge}/g, payload.options.fromAge).
  //         replace(/v{toAge}/g, payload.options.toAge)
  // }
  //console.info("v{context}-->", context)

  const typeDetected = extraWords.filter((extraWord) => {
    return extraWord.lang == languageShortIso;
  })[0];

  //console.info("typeDetected-->>", typeDetected)

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
    .replace(/v{courseName}/g, context)
    .replace(/v{languageName}/g, languageName)
    .replace(/v{text}/g, formattedText)
    .replace(/v{promptCourseStructure}/g, promptCourseStructure);

  //console.info(contentType + " Prompt -->", prompt)

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
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
      payload.courseCode,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );

    let data = response.choices[0].message.content.trim();

    // const formattedData =
    //   formattedText + ": " + data.charAt(0).toUpperCase() + data.slice(1);
    // const paragraphs = splitParagraphs(formattedData, true);

  const formattedData =
    data.charAt(0).toUpperCase() + data.slice(1);
  const paragraphs = splitParagraphs(formattedData, true);

    const cleanParagraphs = paragraphs.map((paragraph) => {
      // return cleanText(paragraph);
      return paragraph
    });

    return { content: cleanParagraphs, sectionIndex: index };
  } catch (error) {
    await saveLog(
      `Error creating Paragraph for course: ${payload.courseCode}.`,
      "Error",
      "createParagraphs()",
      "Courses/{courseCode}/CreateContent"
    );
    console.error(error);
    return { content: null, sectionIndex: index };
  }
}
