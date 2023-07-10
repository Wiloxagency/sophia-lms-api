import { AzureFunction, Context } from "@azure/functions"
import { createConnection } from "../shared/mongo"
import { saveLog } from "../shared/saveLog";
import { createContentCycle } from "../CreateContent/cycle";

const database = createConnection()
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);
    let currentDate = new Date()
    // let currentDatePlus5Minutes = new Date(currentDate.getTime() + 2 * 60000)
    const db = await database
    const CoursesUnderConstructionCollection = db.collection("coursesUnderConstruction")
    const CoursesUnderConstruction = await CoursesUnderConstructionCollection.find({}).toArray()

    for (let courseUnderConstruction of CoursesUnderConstruction) {
        let timestampPlus5Minutes = new Date(courseUnderConstruction.timestamp.getTime() + 2 * 60000)

        if (currentDate > (timestampPlus5Minutes)) {
            // console.log("IT'S BEEN MORE THANT 2 MINUTES SINCE LAST UPDATE")
            const Courses = db.collection('course')
            const currentCourse = await Courses.findOne({ "code": courseUnderConstruction.courseCode })

            try {

                if (currentCourse == null) {
                    saveLog(`Unable to reinitialize course creation because course doesn't exist: ${courseUnderConstruction.courseCode}`, "Error", "CreateContentCron()", "Courses/{courseCode}/CreateContent")
                    await CoursesUnderConstructionCollection.findOneAndDelete({ "courseCode": courseUnderConstruction.courseCode })
                    throw new Error(`Course ${courseUnderConstruction.courseCode} does not exist`)
                }
                saveLog(`Reinitializing course creation: ${courseUnderConstruction.courseCode}`, "Warning", "CreateContentCron()", "Courses/{courseCode}/CreateContent")


                for (let sectionIndex = 0; sectionIndex < currentCourse.sections.length; sectionIndex++) {
                    const elements = currentCourse.sections[sectionIndex].elements
                    for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                        if ((elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length == 0) ||
                            (elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length > 0 && typeof elements[elementIndex].elementLesson.paragraphs[0] === 'string')) {
                            await createContentCycle(currentCourse, sectionIndex, elementIndex)
                            saveLog(`Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}`, "Info", "CreateContentCron()", "Courses/{courseCode}/CreateContent")
                            break
                        }
                    }
                }
            } catch (error) {
                await saveLog(`Error resuming course: ${courseUnderConstruction.courseCode}, error: ${error.message}`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating docx content"
                    }
                }
            }
        }
    }
}

export default timerTrigger