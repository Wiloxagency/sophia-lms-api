import { createConnection } from "../shared/mongo"
import { saveLog } from "../shared/saveLog";
import { transformSlides } from "./asyncCreateSlides";
import { findBestTemplateMatch } from "./findBestTemplateMatch";
import { Payload } from "./interfaces";
import { findPexelsAssets } from "./pexels";
import { slideMigration } from "./prompts"
import OpenAI from "openai";
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const database = createConnection()

export async function migrateCourse(courseCode: string): Promise<any> {

  const db = await database
  const courses = db.collection("course")
  const course = await courses.findOne({code: courseCode})
  course.isNewSlideStructure = true;
  course.code = uuidv4()
  delete course._id
  await courses.insertOne(course)
  console.info(course.code)
  let sectionIndex = 1
  let elementIndex = 0
  const languageIso = course.language
  const voice = course.voice
  const assetsSource = course.slideshowGlobalAssetsSource == "openai" ? "openai": "pexels"
  const courseStructure = course.sections.map((section: any)=>{
    return section.title
  })

  if (assetsSource == "pexels") {
    findPexelsAssets(course.details.title, course.code, courseStructure, db)
  }
  
  
  const slides = course.sections[sectionIndex].elements[0].elementLesson.paragraphs.map((paragraph: any) => {
    return {title: paragraph.translatedTitleAI, text: paragraph.content}
  })

  

  const presentationName = course.sections[sectionIndex].title
  const courseName = course.details.title
   let prompt = slideMigration.prompt ;
   
    prompt = prompt
      .replace(/v{presentationName}/g, presentationName)
      .replace(/v{courseName}/g, courseName)
      .replace(/v{presentationContent}/g, JSON.stringify(slides) )

    console.info(prompt)
  
    try {
  
      const response = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            "role": "system",
            "content": [
              {
                "type": "text",
                "text": slideMigration.role
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
      
          console.info("slidesArrayPath: ", slidesArrayPath, "formattedSlidesData:", formattedSlidesData)
          await db.collection("course").findOneAndUpdate(
            { code: courseCode },
            {
              $set: {
                [slidesArrayPath]: formattedSlidesData
              },
            }
          );


      return slidesData

    } catch (error) {
        await saveLog(
          `Error: ${error.message} creating Slides for course: ${courseCode}.`,
          "Error",
          "migrateCourse()",
          "v2/ourses/{courseCode}/migrateCourse"
        );
        console.error(error);
        return {error: error.message}
    
      }

  
    

}