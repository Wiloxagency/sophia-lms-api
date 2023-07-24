import { createConnection } from "./mongo"

const database = createConnection()

export async function saveLog(message: string, logType: string, functionName: string, endpoint: string) {
    let date = new Date()
    const logPayload = {
        message: message,
        // timestamp: date.toLocaleString("pt-BR"),
        timestamp: date,
        endpoint: endpoint,
        functionName: functionName,
        logType: logType
    }

    try {
        const db = await database
        const Log = db.collection("log")

        switch (logType) {
            case "Error":
                console.error(logPayload)
                break;

            case "Warning":
                console.warn(logPayload)
                break;

            default:
                console.info(logPayload)
                break;
        }

        await Log.insertOne(logPayload)
    } catch (error) {
        console.error("Fatal error", error)
    }
}

export async function saveCourseCreationLog(courseCode: string, courseTitle: string) {
    let date = new Date()
    const logPayload = {
        courseCode: courseCode,
        courseName: courseTitle,
        timestamp: date,
    }
    try {
        const db = await database
        const CoursesUnderConstruction = db.collection("coursesUnderConstruction")
        await CoursesUnderConstruction.updateOne(
            { courseCode: courseCode },
            { $set: logPayload },
            { upsert: true })
    } catch (error) {
        console.error("Error", error)
    }
}

export async function deleteCourseCreationLog(courseCode: string) {
    try {
        const db = await database
        const CoursesUnderConstruction = db.collection("coursesUnderConstruction")
        const DeleteLog = await CoursesUnderConstruction.deleteOne({ courseCode: courseCode })
    } catch (error) {
        console.error("Error", error)
    }
}
