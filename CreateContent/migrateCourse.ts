import { createConnection } from "../shared/mongo"

const database = createConnection()

export async function migrateCourse(courseCode: string) {

  const db = await database
  const courses = db.collection("course")
  const course = await courses.findOne({code: courseCode})
  const slides = course.sections[0].elements[0].elementLesson.slides.map((slide: any) => {
    return slide.slideContent
  })

  console.info(slides)

}