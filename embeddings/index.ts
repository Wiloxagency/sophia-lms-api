import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog"
import { createConnection } from "../shared/mongo"
import parseMultipartFormData from "@anzp/azure-function-multipart"
import { BlobServiceClient } from "@azure/storage-blob"
const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const db = await database

    const GetEmbeddings = async () => {
        try {
            const Embeddings = db.collection('embedding')
            const allEmbeddings = await Embeddings.find({}).toArray()
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": allEmbeddings
            }
        } catch (error) {
            await saveLog(`Error getting files, error: ${error.message} `, "Error", "GetEmbeddings()", "embeddings")
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

    const GetFolderFiles = async () => {
        console.log(req.query.folderCode)
        try {
            const Embeddings = db.collection('embedding')
            const folderFiles = await Embeddings.find({ folderCode: req.query.folderCode }).toArray()
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": folderFiles
            }
        } catch (error) {
            await saveLog(`Error getting folder files, error: ${error.message} `, "Error", "GetFolderFiles()", "embeddings")
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

    const CreateEmbeddingDocument = async () => {
        try {
            const Embeddings = db.collection('embedding')
            const Organization = db.collection('embedding')
            const createDocumentResponse = await Embeddings.insertOne(req.body)

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": createDocumentResponse
            }
        } catch (error) {
            await saveLog(`Error getting files, error: ${error.message} `, "Error", "GetEmbeddings()", "embeddings")
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

    async function UploadFileToAzure() {
        try {
            const { fields, files } = await parseMultipartFormData(req)
            const responseMessage = {
                fields,
                files,
            }
            const output = responseMessage.files[0].bufferFile as Buffer
            // TODO: CREATE AN ENVIRONMENT VARIABLE FOR THIS 👇🏻
            const blobServiceClient = BlobServiceClient.fromConnectionString("DefaultEndpointsProtocol=https;AccountName=sophiaembeddingsstr;AccountKey=7kSlA9gEyraVjGGIhKoLPaJQj2ADnxsTJGwWTmek1eCdgOWt3Yx2BdZexY+9kw8RfVKKz+3rdvcr+AStgH/7LA==;EndpointSuffix=core.windows.net")
            const containerClient = blobServiceClient.getContainerClient("documents")
            const blockBlobClient = containerClient.getBlockBlobClient(responseMessage.files[0].filename)

            const metadata = {
                converted: 'false',
                embeddings_added: 'false'
            }

            await blockBlobClient.upload(output, output.length)
            await blockBlobClient.setMetadata(metadata)

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { "url": blockBlobClient.url }
            }
        } catch (error) {
            await saveLog(`Error uploading file, error: ${error.message} `, "Error", "UploadFileToAzure()", "Embeddings")

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

    const UpdateEmbeddingDocument = async () => {
        try {
            const Embeddings = db.collection('embedding')

            if (req.query.addedTag != '') {
                const addTagToFile = await Embeddings.updateOne(
                    { code: req.query.fileCode },
                    {
                        $push:
                        {
                            fileTags: req.query.addedTag
                        }
                    }
                )
            } else if (req.query.removedTag != '') {
                const removeTagFromFile = await Embeddings.updateOne(
                    { code: req.query.fileCode },
                    {
                        $pull:
                        {
                            fileTags: req.query.removedTag
                        }
                    }
                )
            }

            context.res = {
                "status": 201,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { response: 'Executed' }
            }
        } catch (error) {
            await saveLog(`Error updating embedding document, error: ${error.message} `, "Error", "UpdateEmbeddingDocument()", "embeddings")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error updating embedding document"
                }
            }
        }
    }

    switch (req.method) {
        case "GET":
            if (req.query.folderCode) {
                await GetFolderFiles()
                break;
            } else {
                await GetEmbeddings()
                break;
            }

        case "POST":
            if (req.query.uploadFileToBlobContainer) {
                await UploadFileToAzure()
                break;
            }
            await CreateEmbeddingDocument()
            break;

        case "PUT":
            await UpdateEmbeddingDocument()
            break;


        default:
            break;
    }

}

export default httpTrigger;