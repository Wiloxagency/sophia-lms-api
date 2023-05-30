import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo"
import { DocumentCreator } from "../shared/downloadElementAsDoc"
import { Packer } from "docx"
import { BlobServiceClient } from "@azure/storage-blob"
import { saveLog } from "../shared/saveLog"
import { v4 as uuidv4 } from 'uuid'
import axios, { AxiosResponse } from 'axios'

const database = createConnection()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const downloadTextElementAsDoc = async (courseCode: string, indexSection: string, indexElement: string) => {
        try {
            // console.log(req.query)
            const db = await database
            const Courses = db.collection('course')
            let courseFindOnePromise = Courses.findOne({ code: req.query.courseCode })
            let course = await courseFindOnePromise
            let textElement = course.sections[parseInt(indexSection)].elements[parseInt(indexElement)].elementText

            let textElementBuffer: Buffer
            const documentCreatorResponse = new DocumentCreator()
            let textElementDocument: any
            let imageBuffer =  (await axios({ url: textElement.cover, responseType: "arraybuffer", timeout:15000 })).data as Buffer
            textElementDocument = documentCreatorResponse.createTextDocument(textElement, imageBuffer)

            await Packer.toBuffer(textElementDocument).then((buffer) => {
                // fs.writeFileSync("My Document.docx", buffer);   
                textElementBuffer = buffer
            })

            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient("files");
            const blobName = uuidv4() + ".docx"
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(textElementBuffer, textElementBuffer.length);

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { "url": blockBlobClient.url }
            }
        } catch (error) {
            await saveLog(`Error downloading text element: ${error.message}`, "Error", "downloadTextElementAsDoc()", "TextElement")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error"
                }
            }
        }
    }

    switch (req.method) {
        case "POST":

            if (req.query.operation == 'download') {
                await downloadTextElementAsDoc(
                    req.query.courseCode,
                    req.query.indexSection,
                    req.query.indexElement
                )
            }
            break;

        default:
            break;
    }

}

export default httpTrigger;