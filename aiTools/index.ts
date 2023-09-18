import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo"
import { BlobServiceClient } from "@azure/storage-blob"
import { saveLog } from "../shared/saveLog"
import parseMultipartFormData from "@anzp/azure-function-multipart"
import xmlbuilder from "xmlbuilder"
import rp = require('request-promise')
import { createAudioWithoutCourse } from "../CreateContent/createAudios"

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

    switch (req.method) {
        case "POST":
            if (req.query.uploadFile) {
                await uploadFile()
                break;
            } else if (req.query.textToSpeech) {
                await textToSpeech()
                break;
            }


        default:
            break;
    }

}

export default httpTrigger