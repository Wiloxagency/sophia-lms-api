import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog"
import { sendScormUnderConstructionEmail } from "../nodemailer/scormDownloadEmail"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {

        const event = req.headers['x-microsoftspeechservices-event']
        const validationToken = req.query.validationToken
        
        sendScormUnderConstructionEmail(
            "LeoLeto@proton.me",
            "Leo",
            JSON.stringify(req.body)
        )

        context.res = {
            "status": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body":
                event == 'Challenge' ? validationToken : event
        }

        return

    } catch (error) {
        await saveLog(`Error getting SpeechToTextWebook, error ${error.message} `, "Error", "SpeechToTextWebook()", "SpeechToTextWebook")

        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": error.toString()
            }
        }

    }
}

export default httpTrigger;