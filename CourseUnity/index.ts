import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const getCourse = async (courseCode: string) => {

    console.log('query', req.headers)
    var section_request = false;
    var section_number = 0;
    if (req.headers.section) {
      section_number = parseInt(req.headers.section)
      section_request = true
    }
    // check if there is a "section" in req.header


    try {
      const db = await database;
      const Courses = db.collection("course");

      const resp = Courses.aggregate([
        {
          $match: {
            code: courseCode,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "author_code",
            foreignField: "code",
            as: "createdBy",
          },
        },
        {
          $addFields: {
            createdBy: "$createdBy.name",
          },
        },
        {
          $unwind: {
            path: "$createdBy",
          },
        },
      ]);

      const body = await resp.toArray();

      const sections = body[0]['sections']
      // const section_content = sections[section_number]

      if (body && body[0]) {
        if (sections.length - 1 < section_number || section_number < 0) {
          await saveLog(
            `Error getting course by code: ${courseCode}`,
            "Error",
            "updateCourse()",
            "Courses/{courseCode?}"
          );
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error, section not found valid sections are 0 - " + (sections.length - 1),
            },
          };
          return;
        }

        if (section_request) {
          const elements= [];

          for (let index = 0; index < body[0]['sections'][section_number].elements.length; index++) {
            if(body[0]['sections'][section_number].elements[index].type == "Lección Engine")
              elements.push({ "elementCode": body[0]['sections'][section_number].elements[index].elementCode, "paragraphs":body[0]['sections'][section_number].elements[index].elementLesson.paragraphs});  
          }

          context.res = {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            
            body:  {"elements":elements, "courseTheme": body[0].courseTheme, "colorTheme": body[0].colorTheme},
          };
        } else {
          context.res = {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: body[0],
          };
        }
      } else {
        await saveLog(
          `Error getting course by code: ${courseCode}`,
          "Error",
          "updateCourse()",
          "Courses/{courseCode?}"
        );
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error getting course by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting course by code: ${courseCode} ` + error.message,
        "Error",
        "updateCourse()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting course by code hhh",
        },
      };
    }
  };


  switch (req.method) {

    case "GET":
      if (req.params.courseCode) 
        await getCourse(req.params.courseCode)
      
      break;

    default:
      break;
  }
};

export default httpTrigger