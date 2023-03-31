import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { BlobServiceClient } from '@azure/storage-blob'
import {BlobInfo} from '../DeleteElement/types'

const database = createConnection()


 const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    // Deleta arquivos de containers

    const deleteAssets = async () => {

        const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=sophieassets;AccountKey=7Phn8lu1cvWdRN8A/S+rQTYgJIGL0bTr9bJeC1Cy4tPtQ/jAAN7qzL6E3dnuCyNhp2Xc3Px841GdQJWUo9vIXg==;EndpointSuffix=core.windows.net"

        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

        const blobInfoList: BlobInfo[] = req.body;

        try {
            for (const blobInfo of blobInfoList) {
              const containerClient = blobServiceClient.getContainerClient(blobInfo.container);
              const blockBlobClient = containerClient.getBlockBlobClient(blobInfo.file);
              await blockBlobClient.delete();
            }
          } catch (err) {
            return undefined
            };
        }; 
        
    // ----------------------------------------------------------------------------------- //
    
    const createCourse = async () => {

        const createdCourses = parseInt(req.body.createdCourses)

        try {

            const db = await database
            const Courses = db.collection('course')
            const resp = Courses.insertOne(req.body.course)

            const body = await resp

            if (body) {

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
                }
            } else {
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating course"
                    }
                }

            }

        } catch (error) {

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": error.toString()
                }
            }

        }
    }

    const updateCourse = async (courseCode: string) => {

        delete req.body._id

        try {

            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.findOneAndUpdate({ 'code': courseCode }, { $set: req.body })
            const body = await resp

            if (body) {

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
                }
            } else {
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error updating course by code"
                    }
                }

            }

        } catch (error) {

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error updating course by code"
                }
            }

        }
    }

    const getCourse = async (courseCode: string) => {


        try {

            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.aggregate(
                [
                    {
                        '$match': {
                            'code': courseCode
                        }
                    },
                    {
                        $lookup: {
                            from: 'user',
                            localField: 'author_code',
                            foreignField: 'code',
                            as: 'createdBy'
                        }
                    }, {
                        $addFields: {
                            createdBy: '$createdBy.name'
                        }
                    }, {
                        $unwind: {
                            path: '$createdBy'
                        }
                    }
                ]
            )

            const body = await resp.toArray()

            if (body && body[0]) {

                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body[0]
                }
            } else {
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error getting course by code"
                    }
                }

            }

        } catch (error) {

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error getting course by code"
                }
            }

        }
    }

    const getCourses = async () => {

    }

    const deleteCourse = async () => {
        try {
            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.deleteOne({ 'code': req.params.courseCode })
            const body = await resp
            if (body) {
                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
                }
            }
        } catch (error) {

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error deleting course by code"
                }
            }

        }
    }

    switch (req.method) {
        case "POST":
            await createCourse()
            await deleteAssets()
            break;

        case "PUT":
            await updateCourse(req.params.courseCode)
            break;

        case "DELETE":
            await deleteCourse()
            break;

        case "GET":
            if (req.params.courseCode) {
                await getCourse(req.params.courseCode)
            } else {
                await getCourses()
            }

            break;

        default:
            break;
    }


}

export default httpTrigger;

