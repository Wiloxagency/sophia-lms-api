import { createConnection } from "./mongo";
import { CourseData } from "./types";
const database = createConnection();

export async function updateCourseDuration(courseCode: any) {
  const db = await database;
  const Courses = db.collection<CourseData>("course");
  let course = await Courses.findOne({ code: courseCode });

  const isNewSlideStructure = course.isNewSlideStructure;

  let allTextInsideCourse: string = "";
  for (const section of course.sections) {
    for (const element of section.elements) {
      if (element.type == "Lección Engine") {
        if (isNewSlideStructure) {
          for (const slide of element.elementLesson.slides) {
            allTextInsideCourse = allTextInsideCourse.concat(slide.audioScript);
          }
        } else {
          for (const paragraph of element.elementLesson.paragraphs) {
            allTextInsideCourse = allTextInsideCourse.concat(
              paragraph.audioScript
            );
          }
        }
      }
    }
  }
  let wordCount = allTextInsideCourse.trim().split(/\s+/).length;
  let courseTimeMinutes = Math.round(wordCount / 140);
  console.log("Course time minutes: ", courseTimeMinutes);
  if (courseTimeMinutes > 59) {
    let formatMinutesToHours = (courseTimeMinutes: any) =>
      `${(courseTimeMinutes / 60) ^ 0}:` + (courseTimeMinutes % 60);
    const formattedTime =
      formatMinutesToHours(courseTimeMinutes).toString() + " h";
    const update = Courses.findOneAndUpdate(
      { code: courseCode },
      {
        $set: {
          duration: formattedTime,
        },
      }
    );
    const updateResponse = await update;
    // console.log(updateResponse)
  } else {
    let formattedMinutes = Math.round(courseTimeMinutes).toString() + " m";
    const update = Courses.findOneAndUpdate(
      { code: courseCode },
      {
        $set: {
          duration: formattedMinutes,
        },
      }
    );
    const updateResponse = await update;
    // console.log(updateResponse)
  }
}
