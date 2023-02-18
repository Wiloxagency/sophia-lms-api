import axios, { AxiosResponse } from 'axios'
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient } from '@azure/storage-blob'
import { createConnection } from "../shared/mongo"
import sharp = require('sharp')
import { v4 as uuidv4 } from 'uuid'


const database = createConnection()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

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
            const imageField = `sections.${sectionIndex}.elements.${elementIndex}.paragraphs.${slideIndex}.imageData.finalImage.url`
            const db = await database
            const Courses = db.collection('course')
            const resp = Courses.findOneAndUpdate({ code: courseCode }, {
                $set: {
                    [imageField]: blockBlobClient.url
                }
            })

        } catch (error) {

        }
    }

    switch (req.method) {
        case "POST":
            //await createCourse()
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