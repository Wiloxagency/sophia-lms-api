import { createConnection } from "../shared/mongo"
import { saveLog } from "../shared/saveLog";
import { slideMigration } from "./prompts"
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const database = createConnection()

export async function migrateCourse(courseCode: string): Promise<any> {

  const db = await database
  const courses = db.collection("course")
  const course = await courses.findOne({code: courseCode})
  const slides = course.sections[0].elements[0].elementLesson.paragraphs.map((paragraph: any) => {
    return {title: paragraph.translatedTitleAI, text: paragraph.content}
  })

  

  const presentationName = course.sections[0].title
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