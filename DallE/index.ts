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
            const input = (await axios({ url: imageUrl, responseType: "arraybuffer" })).data as Buffer;
            const output = await sharp(input)
                .resize(1200, 675)
                .jpeg()
                .toBuffer();

            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient("images");
            const blobName = uuidv4() + ".jpeg"
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(output, output.length);

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