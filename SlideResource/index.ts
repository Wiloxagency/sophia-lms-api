import axios, { AxiosResponse } from 'axios'
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import { createConnection } from "../shared/mongo"
import parseMultipartFormData from "@anzp/azure-function-multipart"
import sharp = require('sharp')
import { v4 as uuidv4 } from 'uuid'

const database = createConnection()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const db = await database
    const Courses = db.collection('course')

    const updateImage = async (
        courseCode: string,
        sectionIndex: number,
        elementIndex: number,
        slideIndex: number,
        externalUrlImage: string) => {

        try {

            const input = (await axios({ url: externalUrlImage, responseType: "arraybuffer" })).data as Buffer;
            const output = await sharp(input)
                .resize(1200, 675)
                .jpeg()
                .toBuffer();

            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient("images");
            const blobName = uuidv4() + ".jpeg"
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(output, output.length);
            const imageField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData.finalImage.url`

            const resp = Courses.findOneAndUpdate({ code: courseCode }, {
                $set: {
                    [imageField]: blockBlobClient.url
                }
            })

            let videoUrlField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo.url`
            const updateResponse = Courses.findOneAndUpdate({ code: courseCode }, {
                $set: {
                    [videoUrlField]: ''
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
                    "message": "Error updating image"
                }
            }

        }
    }

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

            if (resourceType == 'image') {
                let videoUrlField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo.url`
                const updateResponse = Courses.findOneAndUpdate({ code: courseCode }, {
                    $set: {
                        [videoUrlField]: ''
                    }
                })
            }

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

    switch (req.method) {
        case "POST":
            await uploadResource(req)
            break;

        case "PUT":
            await updateImage(
                req.body.courseCode,
                req.body.sectionIndex,
                req.body.elementIndex,
                req.body.slideIndex,
                req.body.externalUrlImage)
            break;

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
};

export default httpTrigger;