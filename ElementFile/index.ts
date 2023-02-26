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

    const uploadResource = async (req: HttpRequest) => {

        try {

            const { fields, files } = await parseMultipartFormData(req)
            const responseMessage = {
                fields,
                files,
            }
            const courseCode = responseMessage.fields[0].value
            const sectionIndex = responseMessage.fields[1].value
            const elementIndex = responseMessage.fields[2].value
            const slideIndex = responseMessage.fields[3].value
            const resourceType = responseMessage.fields[4].value

            const resourceBuffer = responseMessage.files[0].bufferFile as Buffer
            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            let blobName = uuidv4()
            let containerClient: ContainerClient
            let setKey: string
            let resourceField: string
            let output: Buffer
            switch (resourceType) {
                case 'video':
                    containerClient = blobServiceClient.getContainerClient("videos")
                    setKey = "videoUrl"
                    blobName += ".mp4"
                    output = resourceBuffer
                    resourceField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo.url`
                    break;
                case 'image':
                    output = await sharp(resourceBuffer)
                        .resize(1200, 675)
                        .jpeg()
                        .toBuffer();
                    containerClient = blobServiceClient.getContainerClient("images")
                    blobName += ".jpeg"
                    setKey = "imgUrl"
                    resourceField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData.finalImage.url`
                    break;

                default:
                    context.res = {
                        "status": 204,
                        "headers": {
                            "Content-Type": "application/json"
                        }
                    }
                    break;
            }



            const blockBlobClient = containerClient.getBlockBlobClient(blobName)
            await blockBlobClient.upload(output, output.length);

            const updateResponse = Courses.findOneAndUpdate({ code: courseCode }, {
                $set: {
                    [resourceField]: blockBlobClient.url
                }
            })
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
                    "message": "Error updating slide resource"
                }
            }

        }
    }

}

export default httpTrigger;