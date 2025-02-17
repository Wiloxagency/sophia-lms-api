import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import { CourseData, SlideContent } from "../shared/types";
import { createConnection } from "../shared/mongo";
const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { courseCode, sectionIndex, elementIndex, slideIndex } = req.params;
  const updatePayload = req.body as Partial<SlideContent>;

  try {
    const db = await database;
    const Courses = db.collection<CourseData>("course");

    const updateQuery = Object.keys(updatePayload).reduce(
      (acc, key) => ({
        ...acc,
        [`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.slideContent.${key}`]:
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
      context.res = { status: 200, body: { message: "Slide content updated" } };
    }
  } catch (error) {
    await saveLog(
      `Error updating slideContent: ${courseCode}` + error.message,
      "Error",
      "updateSlideContent()",
      "courses/{courseCode}/sections/{sectionIndex}/elements/{elementIndex}/slides/{slideIndex}/content"
    );
    context.res = {
      status: 500,
      body: { message: "Slide content update failed" },
    };
  }
};

export default httpTrigger;
