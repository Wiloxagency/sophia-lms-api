import { AzureFunction, Context } from "@azure/functions"
import { createConnection } from "../shared/mongo"

const database = createConnection()
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);
    let currentDate = new Date()

    const db = await database
    const CoursesUnderConstructionCollection = db.collection("coursesUnderConstruction")

    const CoursesUnderConstruction = await CoursesUnderConstructionCollection.find({}).toArray()

    for (let courseUnderConstruction of CoursesUnderConstruction) {

        if (courseUnderConstruction.timestamp > (currentDate + 5 minutes)) {
            let resumeCoursePayload = {
                courseCode: courseUnderConstruction.courseCode,
                type: 'resume'
            }

            CreateContent(resumeCoursePayload)
        }
    }

};

export default timerTrigger;