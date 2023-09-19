import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo"
import { BlobServiceClient } from "@azure/storage-blob"
import { saveLog } from "../shared/saveLog"
import parseMultipartFormData from "@anzp/azure-function-multipart"
import xmlbuilder from "xmlbuilder"
import rp = require('request-promise')
import { createAudioWithoutCourse, getAccessToken } from "../CreateContent/createAudios"
import fs from "fs"
const axios = require('axios');

// import sdk from "microsoft-cognitiveservices-speech-sdk"

const sdk = require("microsoft-cognitiveservices-speech-sdk");

const database = createConnection()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const db = await database

    const uploadFile = async () => {
        try {
            const { fields, files } = await parseMultipartFormData(req)
            const responseMessage = {
                fields,
                files,
            }
            const output = responseMessage.files[0].bufferFile as Buffer
            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
            const containerClient = blobServiceClient.getContainerClient("files")
            const blockBlobClient = containerClient.getBlockBlobClient(responseMessage.files[0].filename)
            await blockBlobClient.upload(output, output.length)

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { "url": blockBlobClient.url }
            }
        } catch (error) {
            await saveLog(`Error uploading file, error: ${error.message} `, "Error", "AzureFunction()", "ElementFile")

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error uploading file"
                }
            }
        }
    }

    const textToSpeech = async () => {
        // console.log(req.body)
        try {
            let TTSResponse = await createAudioWithoutCourse(
                req.body.text,
                req.body.voice,
                req.body.language
            )
            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { url: TTSResponse.url }
            }
        } catch (error) {
            await saveLog(`Error creating TTS: ${error.message} `, "Error", "textToSpeech()", "aiTools/")

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error uploading file"
                }
            }
        }


    }

    const speechToText = async () => {
        // const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.TTS_SUBSCRIPTION_KEY, 'eastus2');
        // speechConfig.speechRecognitionLanguage = "en-US";
        // let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("test.wav"));
        // let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        // let recognizedText = ''
        try {
            // speechRecognizer.recognizeOnceAsync(result => {
            //     switch (result.reason) {
            //         case sdk.ResultReason.RecognizedSpeech:
            //             console.log(`RECOGNIZED: Text=${result.text}`);
            //             recognizedText = `${result.text}`
            //             console.log('1', recognizedText);
            //             break;
            //         case sdk.ResultReason.NoMatch:
            //             console.log("NOMATCH: Speech could not be recognized.");
            //             break;
            //         case sdk.ResultReason.Canceled:
            //             const cancellation = sdk.CancellationDetails.fromResult(result);
            //             console.log(`CANCELED: Reason=${cancellation.reason}`);

            //             if (cancellation.reason == sdk.CancellationReason.Error) {
            //                 console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            //                 console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
            //                 console.log("CANCELED: Did you set the speech resource key and region values?");
            //             }
            //             break;
            //     }
            //     speechRecognizer.close();
            // });
            // console.log('THIS RUNS');
            // console.log('2', recognizedText);

            let data = fs.readFileSync("test.wav")
            let accesToken = await getAccessToken(process.env.TTS_SUBSCRIPTION_KEY)

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://eastus2.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US',
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.TTS_SUBSCRIPTION_KEY,
                    'Content-Type': 'audio/wav',
                    'Authorization': `Bearer ${accesToken}`
                },
                data: data
            };

            await axios.request(config)
                .then((response) => {
                    // console.log(JSON.stringify(response.data));
                    context.res = {
                        "status": 201,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": response.data
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

        } catch (error) {
            await saveLog(`Error creating STT: ${error.message} `, "Error", "speechToText()", "aiTools/")

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error uploading file"
                }
            }
        }


    }

    switch (req.method) {
        case "POST":
            if (req.query.uploadFile) {
                await uploadFile()
                break;
            } else if (req.query.textToSpeech) {
                await textToSpeech()
                break;
            } else if (req.query.speechToText) {
                await speechToText()
                break;
            }


        default:
            break;
    }

}

export default httpTrigger