import { createConnection } from "./mongo"

const database = createConnection()

export async function saveLog(message: string, logType: string, functionName: string, endpoint: string) {
    let date = new Date()
    const logPayload = {
        message:message,
        timestamp: date.toLocaleString("pt-BR"),
        endpoint: endpoint,
        functionName: functionName,
        logType: logType
    }

    try {
        const db = await database
        const Log = db.collection("log")
        if (logType == "Error") {
            console.error(logPayload)
        } else {
            console.info(logPayload)
        }
        await Log.insertOne(logPayload)
    } catch (error) {
        console.error("Fatal error", error)
    }
    
}