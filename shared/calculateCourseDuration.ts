import { createConnection } from "./mongo";
const database = createConnection();

export async function getCourseDuration(course: any) {
    const db = await database;
    const Courses = db.collection("course")
    let allTextInsideCourse: string = ''
    for (const section of course.sections) {
        for (const element of section.elements) {
            if (element.type == 'Lección Engine') {
                for (const paragraph of element.elementLesson.paragraphs) {
                    allTextInsideCourse = allTextInsideCourse.concat(paragraph.audioScript)
                }
            }
        }
    }
    let wordCount = allTextInsideCourse.trim().split(/\s+/).length
    let courseTimeMinutes = Math.round(wordCount / 140)
    if (courseTimeMinutes > 59) {
        let formatMinutesToHours = (courseTimeMinutes: any) => `${courseTimeMinutes / 60 ^ 0}:` + courseTimeMinutes % 60
        const formattedTime = formatMinutesToHours(courseTimeMinutes).toString() + ' h'
        const update = Courses.findOneAndUpdate(
            { code: course.courseCode },
            {
                $set: {
                    "duration": formattedTime
                }
            }
        )
        const updateResponse = await update
        console.log(updateResponse)
    } else {
        let formattedMinutes = Math.round(courseTimeMinutes).toString() + ' m'
        const update = Courses.findOneAndUpdate(
            { code: course.courseCode },
            {
                $set: {
                    "duration": formattedMinutes
                }
            }
        )
        const updateResponse = await update
        console.log(updateResponse)
    }
}