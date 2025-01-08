import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  console.log(req.body);


  const prompt =
  `Considering the context of the course "Socialismo en el siglo XXI", 
  create an extensive content in spanish explaining the subject "Régimenes Socialistas en Latinoamérica", 
  the paragraphs must be relevant and the information must be exclusively from that subject. 
  The generated content will be use in 10 slides of a lesson like a presentation.
  Each slide must have a title and a text. Some slides may contain between 0 and 4 sections; 
  It is very important that the number of sections varies across the slides. 
  Some slides with a large title and a lot of text should not have any sections, 
  while others should have only one section, and some should have 2, 3, or 4 sections. 
  The distribution should ensure that no specific number of sections predominates. 
  The more extensive the subtitles and texts are, the more sections that slide should have.
  At least two slide must have no sections, at least two slide must have 1 section, 
  at least two must have 2 sections, at least one must have 3 sections, 
  and at least one must have 4 sections. All slides must have a title and text.
  No slide should have more than 4 sections.
  `


  const lessonResp = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": "You are an expert in the area of content development.\n"
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

  const lessonResponse = lessonResp.choices[0].message.parsed

  console.info(lessonResponse)

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: lessonResponse,
  };
};

export default httpTrigger;
