import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createAudio } from "../CreateContent/createAudios"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const audioData = req.body
    const newAudio = await createAudio(
        audioData.text, 
        audioData.voice, 
        audioData.language, 
        audioData.courseCode, 
        audioData.sectionIndex, 
        audioData.elementIndex, 
        audioData.paragraphIndex)

        try {

            const db = await database
            const Course = db.collection("course")
            const audioPath =  `sections.${audioData.sectionIndex}.elements.${audioData.elementIndex}.elementLesson.paragraphs.${audioData.paragraphIndex}.audioUrl`
            await Course.findOneAndUpdate({ code: audioData.courseCode }, {
                $set: { [audioPath]: newAudio.url }
            })

            if (newAudio) {
                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": newAudio
                }
            } else {
                await saveLog(`Error re-creating audio.`, "Error", "AzureFunction()", "TextToSpeech")

                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error re-creating audio, newAudio is undefine"
                    }
                }
            }

        } catch (error) {
            await saveLog(`Error re-creating audio, error ${error.message}`, "Error", "AzureFunction()", "TextToSpeech")

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error re-creating audio "
                }
            }

        }

        


}  
export default httpTrigger;