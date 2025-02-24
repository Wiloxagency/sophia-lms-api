import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CourseData, LessonSlide } from "../shared/types";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function updateSlide() {
    const { courseCode, sectionIndex, elementIndex, slideIndex, blockIndex } =
      req.params;
    const updatePayload = req.body as Partial<LessonSlide>;

    try {
      const db = await database;
      const Courses = db.collection<CourseData>("course");

      const updateQuery = Object.keys(updatePayload).reduce(
        (acc, key) => ({
          ...acc,
          [`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.${key}`]:
            updatePayload[key],
        }),
        {}
      );
      const updatedCourse = await Courses.findOneAndUpdate(
        { code: courseCode },
        { $set: updateQuery },
        { returnDocument: "after" }
      );

      if (!updatedCourse) {
        context.res = { status: 404, body: { message: "Course not found" } };
      } else {
        context.res = { status: 200, body: { message: "Slide updated" } };
      }
    } catch (error) {
      await saveLog(
        `Error  updating slide, error ${error.message}`,
        "Error",
        "updateSlide()",
        "courses/{courseCode}/sections/{sectionIndex}/elements/{elementIndex}/slides/{slideIndex}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Slide update failed",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      break;

    case "DELETE":
      break;

    case "PUT":
      await updateSlide();
      break;

    case "GET":
      break;

    default:
      break;
  }
};

export default httpTrigger;
