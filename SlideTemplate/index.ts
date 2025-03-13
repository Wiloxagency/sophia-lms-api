import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { CourseData } from "../shared/types";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { courseCode, sectionIndex, elementIndex, slideIndex } = req.params;

  try {
    const db = await database;
    const Courses = db.collection<CourseData>("course");
    const course = await Courses.findOne({ code: courseCode });

    if (!course) {
      context.res = {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { response: "Course not found" },
      };
      return;
    }

    const slide =
      course.sections?.[sectionIndex]?.elements?.[elementIndex]?.elementLesson
        .slides?.[slideIndex];

    if (!slide) {
      context.res = {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { response: "Slide not found" },
      };
      return;
    }

    // // Apply logic to determine the appropriate slideTemplate
    // const assignedTemplate = determineTemplateForSlide(slide);

    // // Update the slideTemplate field in MongoDB
    // const updatePath = `sections.${sectionIndex}.elements.${elementIndex}.slides.${slideIndex}.slideTemplate`;
    // await Courses.updateOne(
    //   { code: courseCode },
    //   { $set: { [updatePath]: assignedTemplate } }
    // );

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        response: "Slide template assigned",
        // slideTemplate: assignedTemplate,
        slideTemplate: "assignedTemplate",
      },
    };
  } catch (error) {
    console.error(error);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { response: "Slide template assignment failed" },
    };
  }
};

export default httpTrigger;
