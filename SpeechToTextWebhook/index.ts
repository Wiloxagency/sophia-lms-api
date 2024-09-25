import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog"
import { sendScormUnderConstructionEmail } from "../nodemailer/sendMiscEmails"
import { updateSlideAfterTranscriptionJob } from "../shared/azureSpeechToText"

const axios = require('axios').default

interface transcriptionInterface {
    display: string
    displayWords: {
        displayText: string
        offsetInTicks: number
        durationInTicks: number
    }[]
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        const event = req.headers['x-microsoftspeechservices-event']
        const validationToken = req.query.validationToken

        if (event != 'Challenge') {

            getCustomParameters(req.body.self)

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

    async function getCustomParameters(transcriptionJobUrl: string) {

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: transcriptionJobUrl,
            headers: {
                'Ocp-Apim-Subscription-Key': '205669de4511412299e6684bb83e5eb1'
            }
        }

        axios.request(config)
            .then((response) => {

                getTranscriptionFileUrl(
                    response.data.self,
                    response.data.customProperties.courseCode,
                    response.data.customProperties.indexSection,
                    response.data.customProperties.indexElement,
                    response.data.customProperties.indexParagraph
                )
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async function getTranscriptionFileUrl(
        transcriptionFilesUrl: string,
        courseCode: string,
        indexSection: number,
        indexElement: number,
        indexParagraph: number
    ) {

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: transcriptionFilesUrl + '/files',
            headers: {
                'Ocp-Apim-Subscription-Key': '205669de4511412299e6684bb83e5eb1'
            }
        }

        axios.request(config)
            .then((response) => {

                getTranscriptionResult(
                    response.data.values[0].links.contentUrl,
                    courseCode,
                    indexSection,
                    indexElement,
                    indexParagraph
                )
            })
            .catch((error) => {
                console.log(error)
            })
    }

    async function getTranscriptionResult(
        transcriptionContentUrl: string,
        courseCode: string,
        indexSection: number,
        indexElement: number,
        indexParagraph: number,
    ) {

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: transcriptionContentUrl,
            headers: {
                'Ocp-Apim-Subscription-Key': '205669de4511412299e6684bb83e5eb1'
            }
        }

        axios.request(config)
            .then((response) => {

                let parsedTranscriptionResult: transcriptionInterface = { display: '', displayWords: [] }

                for (const phrase of response.data.recognizedPhrases) {
                    parsedTranscriptionResult.display =
                        parsedTranscriptionResult.display
                        + ' '
                        + phrase.nBest[0].display

                    for (const word of phrase.nBest[0].displayWords) {
                        parsedTranscriptionResult.displayWords.push(
                            {
                                displayText: word.displayText,
                                offsetInTicks: word.offsetInTicks,
                                durationInTicks: word.durationInTicks
                            }

                        )
                    }

                }

                updateSlideAfterTranscriptionJob(
                    courseCode,
                    indexSection,
                    indexElement,
                    indexParagraph,
                    transcriptionContentUrl,
                    'finished',
                    parsedTranscriptionResult
                )

                // const debugResponse =
                //     JSON.stringify(response.data.combinedRecognizedPhrases[0].display)
                //     + courseCode
                //     + indexSection
                //     + indexElement
                //     + indexParagraph
                // // console.log(JSON.stringify(response.data))

                // sendScormUnderConstructionEmail(
                //     "LeoLeto@proton.me",
                //     "Leo",
                //     debugResponse
                // )
            })
            .catch((error) => {
                console.log(error)
            })
    }
}

export default httpTrigger;