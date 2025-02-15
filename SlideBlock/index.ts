import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { CourseData, SlideBlock } from "../shared/types";
import { saveLog } from "../shared/saveLog";
const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { courseCode, sectionIndex, elementIndex, slideIndex, blockIndex } =
    req.params;
  const updatePayload = req.body as Partial<SlideBlock>;

  try {
    const db = await database;
    const Courses = db.collection<CourseData>("course");

    const updateQuery = Object.keys(updatePayload).reduce(
      (acc, key) => ({
        ...acc,
        [`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.slideContent.sections.${blockIndex}.${key}`]:
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
      context.res = { status: 200, body: { message: "Slide block updated" } };
    }
  } catch (error) {
    await saveLog(
      `Error updating slideBlock: ${courseCode}` + error.message,
      "Error",
      "updateSlideBlock()",
      "courses/{courseCode}/sections/{sectionIndex}/elements/{elementIndex}/slides/{slideIndex}/blocks/{blockIndex}/"
    );
    context.res = {
      status: 500,
      body: { message: "Slide block update failed" },
    };
  }
};

export default httpTrigger;
