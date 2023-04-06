import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    // const getGroup = async () => {
    //     try {
    //         const db = await database
    //         const Groups = db.collection('group')

    //         const resp = Groups.aggregate(
    //             [
    //                 {
    //                     '$match': {
    //                         'code': req.params.groupCode
    //                     }
    //                 }
    //             ]
    //         )

    //         const body = await resp.toArray()

    //         if (body && body[0]) {

    //             context.res = {
    //                 "status": 200,
    //                 "headers": {
    //                     "Content-Type": "application/json"
    //                 },
    //                 "body": body[0]
    //             }
    //         } else {
    //             context.res = {
    //                 "status": 500,
    //                 "headers": {
    //                     "Content-Type": "application/json"
    //                 },
    //                 "body": {
    //                     "message": "Error getting group by code"
    //                 }
    //             }

    //         }

    //     } catch (error) {

    //         context.res = {
    //             "status": 500,
    //             "headers": {
    //                 "Content-Type": "application/json"
    //             },
    //             "body": {
    //                 "message": "Error getting group by code"
    //             }
    //         }

    //     }
    // }

    const getCourseGroups = async () => {
        try {
            db = await database
            const Groups = db.collection('group')
            const resp = Groups.find({ courseCode: req.params.courseCode }).sort({ _id: -1 })
            const body = await resp.toArray()

            if (body) {
                context.res = {
                    "status": 200,
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
                        "message": "Error getting groups by course"
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
                    "message": "Error in CourseGroups method"
                }
            }
        }
    }

    const createGroup = async () => {

        try {

            const db = await database
            const Groups = db.collection('group')
            const resp = Groups.insertOne(req.body)

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
                        "message": "Error creating group"
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

    const updateGroup = async (groupCode: string) => {

        delete req.body._id

        try {

            const db = await database
            const CourseGroups = db.collection('group')

            const resp = CourseGroups.findOneAndUpdate({ 'code': groupCode }, { $set: req.body })
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
                        "message": "Error updating courseGroup by code"
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
                    "message": "Error updating courseGroup by code"
                }
            }

        }
    }

    const deleteGroup = async () => {
        try {
            const db = await database
            const Groups = db.collection('group')

            const group = await Groups.findOne({ 'code': req.params.groupCode })

            if (!group) {

              context.res = {
                "status": 404,
                "headers": {
                  "Content-Type": "application/json"
                },
                "body": {
                  "message": "courseGroup not found"
                }
              }
              return
            }

            const resp = Groups.deleteOne({ 'code': req.params.groupCode, 'users': { $eq: [] }})

            const body = await resp
            if (body.deletedCount >= 1) {

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
                }
            } else {
                context.res = {
                    "status": 204,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "This group has students and cannot be deleted"
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
                    "message": "Error deleting group by code"
                }
            }

        }
    }

    switch (req.method) {
        case "POST":
            await createGroup()
            break;

        case "PUT":
            await updateGroup(req.params.groupCode)
            break;

        case "GET":
            await getCourseGroups()
            break;

        case "DELETE":
            await deleteGroup()
            break;

        default:
            break;
    }

}

export default httpTrigger;