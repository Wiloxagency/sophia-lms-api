import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo"
import { BlobServiceClient } from "@azure/storage-blob"
import { saveLog } from "../shared/saveLog"
import parseMultipartFormData from "@anzp/azure-function-multipart"
import xmlbuilder from "xmlbuilder"
import rp = require('request-promise')
import { createAudioWithoutCourse, getAccessToken } from "../CreateContent/createAudios"
import fs from "fs"
import { main } from "./summarize"

const axios = require('axios');

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
        try {
            const { fields, files } = await parseMultipartFormData(req)
            const responseMessage = {
                fields,
                files,
            }
            const output = responseMessage.files[0].bufferFile as Buffer
            let data = output
            let accesToken = await getAccessToken(process.env.TTS_SUBSCRIPTION_KEY)

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://eastus2.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=es-MX',
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
                    // console.log(error);
                    saveLog(`Error creating STT: ${error.message} `, "Error", "speechToText()", "aiTools/")

                    context.res = {
                        "status": 500,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": {
                            "message": "Error uploading file"
                        }
                    }
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

    console.info(req.query)
    switch (req.method) {
        case "POST":

            switch (req.query.tool) {
                case "uploadFile":
                    await uploadFile()
                    break;

                case "textToSpeech":
                    await textToSpeech()
                    break;

                case "speechToText":
                    await speechToText()
                    break;

                case "summarize":
                    const fullcontent = await main(req.body.vectorStoreId, req.body.conciseness, req.body.language)
                    context.res = {
                        "status": 200,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": fullcontent
                    }
                    break;
            
                default:
                    break;
            }



        default:
            break;
    }

}

export default httpTrigger