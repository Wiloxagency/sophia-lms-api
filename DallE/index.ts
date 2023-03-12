import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosResponse } from 'axios'
import sharp = require('sharp')
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import { v4 as uuidv4 } from 'uuid'
import { createConnection } from "../shared/mongo"

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const db = await database
    const Courses = db.collection('course')
    const { Configuration, OpenAIApi } = require("openai")
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)

    const createImages = async () => {
        try {
            const response = await openai.createImage({
                prompt: req.body.prompt,
                // prompt: "a white siamese cat",
                n: 4,
                size: "1024x1024",
            })

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { "response": response.data.data }
            }

        } catch (error) {

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error creating image"
                }
            }
        }
    }

    const updateImage = async (
        imageUrl: string,
        courseCode: string,
        sectionIndex: number,
        elementIndex: number,
        slideIndex?: number
    ) => {
        try {
            const imageBufferInput = (await axios({ url: imageUrl, responseType: "arraybuffer" })).data as Buffer;
            const imageBufferOutput = await sharp(imageBufferInput)
                .jpeg()
                .toBuffer()
            let processedSquareImage = await ProcessSquareImage(imageBufferOutput)
            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient("images");
            const blobName = uuidv4() + ".jpeg"
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(processedSquareImage, processedSquareImage.length);

            if (req.body.indexSlide) {
                const imageField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData.finalImage.url`
                const resp = Courses.findOneAndUpdate({ code: courseCode }, {
                    $set: {
                        [imageField]: blockBlobClient.url
                    }
                })
            } else {
                console.log('UPDATIND COURSE COVER')
            }

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { "imageUrl": blockBlobClient.url }
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

    async function ProcessSquareImage(imageBuffer) {
        let foregroundImageBuffer = await
            sharp(imageBuffer)
                .resize({
                    width: 1024,
                    height: 576,
                    fit: 'contain',
                    position: 'center',
                    background: { r: 255, g: 0, b: 0, alpha: 0 }
                })
                // .toFile('test.png')
                .toFormat('png')
                .toBuffer()
        let backgroundImageBuffer = await
            sharp(imageBuffer)
                .blur(10)
                .resize({
                    width: 1024,
                    height: 576,
                    fit: 'cover',
                    position: 'center'
                })
                // .toFile('test2.jpg')
                .toBuffer()
        let composite = await sharp(backgroundImageBuffer)
            .composite([{
                input: foregroundImageBuffer
            }])
            // .toFile('test4.jpg')
            .toBuffer()
        return composite
    }

    switch (req.method) {
        case "POST":
            await createImages()
            break;

        case "PUT":
            await updateImage(
                req.body.imageUrl,
                req.body.courseCode,
                req.body.indexSection,
                req.body.indexElement,
                req.body.indexSlide)
            break;

        default:
            break;
    }

}

export default httpTrigger