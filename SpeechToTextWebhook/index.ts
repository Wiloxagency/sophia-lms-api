import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog"
import { sendScormUnderConstructionEmail } from "../nodemailer/scormDownloadEmail"

const axios = require('axios').default

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        const event = req.headers['x-microsoftspeechservices-event']
        const validationToken = req.query.validationToken

        if (event == 'Challenge') {

        } else {
            sendScormUnderConstructionEmail(
                "LeoLeto@proton.me",
                "Leo",
                JSON.stringify(req.body)
            )

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: req.body.self + '/files',
                headers: {
                    'Ocp-Apim-Subscription-Key': '205669de4511412299e6684bb83e5eb1'
                }
            }

            axios.request(config)
                .then((response) => {

                    getTranscriptionResult(response.data.values[0].links.contentUrl)
                })
                .catch((error) => {
                    console.log(error)
                })
        }

        context.res = {
            "status": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body":
                event == 'Challenge' ? validationToken : event
        }

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

    async function getTranscriptionResult(transcriptionFileUrl: string) {

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: transcriptionFileUrl,
            headers: {
                'Ocp-Apim-Subscription-Key': '205669de4511412299e6684bb83e5eb1'
            }
        };

        axios.request(config)
            .then((response) => {
                // console.log(JSON.stringify(response.data))
                sendScormUnderConstructionEmail(
                    "LeoLeto@proton.me",
                    "Leo",
                    JSON.stringify(response.data)
                )
            })
            .catch((error) => {
                console.log(error)
            })
    }
}

export default httpTrigger;