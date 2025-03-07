import {
  conclusionGeneration,
  contentGeneration,
  slideGeneration,
  introductionGeneration,
} from "./prompts";
import { saveLog } from "../shared/saveLog";
import { extraWords } from "../Language/extrawords";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";
import { createConnection } from "../shared/mongo";
import { GlassTemplate } from "../themesTemplates/GlassTemplate";
import { 
  InputData,
  MetaTag, 
  OutputData, 
  OutputSlide, 
  Payload, 
  SlideContent
} from "./interfaces";
import { findBestTemplateMatch } from "./findBestTemplateMatch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const database = createConnection()

// Helper function to clean text from HTML, markup and special characters
function cleanText(text: string): string {
  // Remove HTML tags
  let cleanedText = text.replace(/<[^>]*>/g, '');
  // Remove markdown bold/italic markers
  cleanedText = cleanedText.replace(/\*\*|\*/g, '');
  // Remove any other special characters if needed
  return cleanedText;
}

// Function to generate audio script from slide content
function generateAudioScript(slideContent: SlideContent): string {
  const titleText = cleanText(slideContent.title);
  const mainText = cleanText(slideContent.text);

  const sectionsText = slideContent.sections.map(section => {
    const subtitle = cleanText(section.subtitle);
    const text = cleanText(section.text);
    return `${subtitle}: ${text}`;
  }).join(' ');

  return `${titleText}: ${mainText} ${sectionsText}`;
}

// Main transformation function
export function transformSlides(input: InputData): OutputData {
  const transformedSlides: OutputSlide[] = input.slides.map(inputSlide => {
    const slideContent: SlideContent = {
      title: inputSlide.title,
      text: inputSlide.text,
      sections: inputSlide.sections
    };

    // Using type assertion to ensure empty array matches never[]
    const emptyArray: Array<never> = [] as Array<never>;

    return {
      slideTemplate: '',
      slideContent,
      audioScript: generateAudioScript(slideContent),
      audioUrl: '',
      assets: emptyArray
    };
  });

  return {
    slides: transformedSlides
  };
}



export async function asyncCreateSlides(
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

  //Temp
  prompt = slideGeneration.prompt;

  prompt = prompt
    .replace(/v{courseName}/g, formattedCourseName)
    .replace(/v{languageName}/g, languageName)
    .replace(/v{text}/g, formattedText)
    .replace(/v{promptCourseStructure}/g, promptCourseStructure);



  try {

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": slideGeneration.role
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        },
        {
          "role": "assistant",
          "refusal": "I'm sorry, I can't assist with that request."
        }
      ],
      response_format: {
        "type": "json_schema",
        "json_schema": {
          "name": "presentation",
          "strict": true,
          "schema": {


            "type": "object",
            "properties": {
              "slides": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "text": {
                      "type": "string"
                    },
                    "sections": {

                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "subtitle": {
                            "type": "string"
                          },
                          "text": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": false,
                        "required": ["subtitle", "text"]
                      }


                    }
                  },
                  "additionalProperties": false,
                  "required": ["title", "text", "sections"]
                }
              }
            },
            "additionalProperties": false,
            "required": ["slides"]
          }
        }
      }
    });




    updateCourseTokens(
      courseCode,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );

    const slidesData: any = response.choices[0].message.parsed || []

    let date = new Date()

    let slidesArrayPath =
      `sections.${sectionIndex}.elements.${elementIndex}.elementLesson`;

    const formattedSlidesData = transformSlides(slidesData)
    let payloads = []
    formattedSlidesData.slides.forEach((element, slideIndex) => {
      const templateElement = findBestTemplateMatch(element.slideContent, "glass")
      element.slideTemplate = templateElement[0].code
      
      let payload: Payload = {
        timestamp: date,
        courseName: courseName,
        courseCode: courseCode,
        sectionIndex: sectionIndex,
        elementIndex: elementIndex,
        slideIndex: slideIndex,
        paragraph: element.audioScript,
        language: languageIso,
        voice: voice,
        assets: templateElement[0].elements.media,
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
      payloads.push(payload)

    });

    const slide = db.collection("slide")
    await slide.insertMany(payloads)

    await db.collection("course").findOneAndUpdate(
      { code: courseCode },
      {
        $set: {
          [slidesArrayPath]: formattedSlidesData
        },
      }
    );

  } catch (error) {
    await saveLog(
      `Error: ${error.message} creating Slides for course: ${courseCode}.`,
      "Error",
      "asyncCreateSlides()",
      "Courses/{courseCode}/CreateContent"
    );
    console.error(error);

  }
}
