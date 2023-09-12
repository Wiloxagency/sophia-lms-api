import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo"
import { BlobServiceClient } from "@azure/storage-blob"
import { saveLog } from "../shared/saveLog"
import parseMultipartFormData from "@anzp/azure-function-multipart"

const database = createConnection()
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    console.log('THIS RAN')
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

    switch (req.method) {
        case "POST":
            await uploadFile()
            break;

        default:
            break;
    }

}

export default httpTrigger