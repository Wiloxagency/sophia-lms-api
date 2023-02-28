import parseMultipartFormData from "@anzp/azure-function-multipart"
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob"
import { createConnection } from "../shared/mongo"
import { v4 as uuidv4 } from 'uuid'
import sharp = require("sharp")

const database = createConnection()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const db = await database
    const Courses = db.collection('course')

    const uploadFile = async (req: HttpRequest) => {
        try {
            const { fields, files } = await parseMultipartFormData(req)
            const responseMessage = {
                fields,
                files,
            }
            const courseCode = responseMessage.fields[0].value
            const sectionIndex = responseMessage.fields[1].value
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
            await uploadFile(req)
            break;

        // case "PUT":
        //     await 
        //     break;

        case "GET":
            if (req.params.courseCode) {
                //await getCourse(req.params.courseCode)
            } else {
                //await getCourses()
            }

            break;

        default:
            break;
    }
}

export default httpTrigger;