import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTranscriptionJob } from "../shared/azureSpeechToText";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    createTranscriptionJob(
        '65962c5b-58b1-4fee-a3d2-e0f1eecd8c92',
        0,
        0,
        0,
        'https://audio-lingua.ac-versailles.fr/IMG/mp3/frixuelos.mp3',
        'es-ES'
    )

    // const transcriptionResult = {
    //     "source": "...",
    //     "timestamp": "2023-07-10T14:28:16Z",
    //     "durationInTicks": 25800000,
    //     "duration": "PT2.58S",
    //     "combinedRecognizedPhrases": [
    //         {
    //             "channel": 0,
    //             "lexical": "hello world",
    //             "itn": "hello world",
    //             "maskedITN": "hello world",
    //             "display": "Hello world."
    //         }
    //     ],
    //     "recognizedPhrases": [
    //         {
    //             "recognitionStatus": "Success",
    //             "channel": 0,
    //             "offset": "PT0.76S",
    //             "duration": "PT1.32S",
    //             "offsetInTicks": 7600000.0,
    //             "durationInTicks": 13200000.0,
    //             "nBest": [
    //                 {
    //                     "confidence": 0.5643338,
    //                     "lexical": "hello world",
    //                     "itn": "hello world",
    //                     "maskedITN": "hello world",
    //                     "display": "Hello world.",
    //                     "displayWords": [
    //                         {
    //                             "displayText": "Hello",
    //                             "offset": "PT0.76S",
    //                             "duration": "PT0.76S",
    //                             "offsetInTicks": 7600000.0,
    //                             "durationInTicks": 7600000.0
    //                         },
    //                         {
    //                             "displayText": "world.",
    //                             "offset": "PT1.52S",
    //                             "duration": "PT0.56S",
    //                             "offsetInTicks": 15200000.0,
    //                             "durationInTicks": 5600000.0
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     "confidence": 0.1769063,
    //                     "lexical": "helloworld",
    //                     "itn": "helloworld",
    //                     "maskedITN": "helloworld",
    //                     "display": "helloworld"
    //                 },
    //                 {
    //                     "confidence": 0.49964225,
    //                     "lexical": "hello worlds",
    //                     "itn": "hello worlds",
    //                     "maskedITN": "hello worlds",
    //                     "display": "hello worlds"
    //                 },
    //                 {
    //                     "confidence": 0.4995761,
    //                     "lexical": "hello worm",
    //                     "itn": "hello worm",
    //                     "maskedITN": "hello worm",
    //                     "display": "hello worm"
    //                 },
    //                 {
    //                     "confidence": 0.49418187,
    //                     "lexical": "hello word",
    //                     "itn": "hello word",
    //                     "maskedITN": "hello word",
    //                     "display": "hello word"
    //                 }
    //             ]
    //         }
    //     ]
    // }

    // let parsedTranscriptionResult: {
    //     display: string
    //     displayWords: {
    //         displayText: string
    //         offsetInTicks: number
    //         durationInTicks: number
    //     }[]
    // } = {
    //     display: '',
    //     displayWords: [{
    //         displayText: '',
    //         offsetInTicks: 0,
    //         durationInTicks: 0
    //     }]
    // }

    // console.log(parsedTranscriptionResult)

    // parsedTranscriptionResult.display = transcriptionResult.recognizedPhrases[0].nBest[0].display

    // parsedTranscriptionResult.displayWords =
    //     transcriptionResult.recognizedPhrases[0].nBest[0].displayWords
    //         .map(word => {
    //             return {
    //                 displayText: word.displayText,
    //                 offsetInTicks: word.offsetInTicks,
    //                 durationInTicks: word.durationInTicks
    //             }
    //         })

    // console.log(parsedTranscriptionResult)

}

export default httpTrigger