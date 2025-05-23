import { Context, HttpRequest } from "@azure/functions";
import { addDocumentsSections } from "../../CreateContent";
import { asyncCreateContent } from "../../CreateContent/asyncCycle";
import { createConnection } from "../../shared/mongo";
import { CourseData } from "../../shared/types";

export async function handleCreateCourse(context: Context, req: HttpRequest) {
  const { courseCode, structure } = req.body || {};

  if (!courseCode || !structure) {
    context.res = {
      status: 400,
      body: { error: "Missing required fields in request body." },
    };
    return;
  }

  const db = await createConnection();
  const Courses = db.collection<CourseData>("course");
  const course = await Courses.findOne({ code: courseCode });

  if (!course) {
    context.res = {
      status: 404,
      body: { error: "Course not found" },
    };
    return;
  }

  const addedSections = addDocumentsSections(
    course,
    structure,
    course.slideshowColorThemeName
  )["sections"];
  const expandedCourse: Partial<CourseData> & { generationType: string } = {
    ...course,
    sections: addedSections,
    generationType: "newAgent",
  };

  await asyncCreateContent(expandedCourse);

  context.res = {
    status: 200,
    body: { message: "Course creation initiated" },
  };
}
