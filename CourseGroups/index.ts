import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

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
                await saveLog("Error getting groups by course ", "Error", "getCourseGroups()", "CourseGroups/{courseCode?}/{groupCode?}")
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
            await saveLog("Error in CourseGroups method: " + error.message, "Error", "getCourseGroups()", "CourseGroups/{courseCode?}/{groupCode?}")
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
                await saveLog("Error creating group", "Error", "createGroup()", "CourseGroups/{courseCode?}/{groupCode?}")
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
            await saveLog("Error creating group: " + error.message, "Error", "createGroup()", "CourseGroups/{courseCode?}/{groupCode?}")
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
                await saveLog("Error updating courseGroup by code", "Error", "updateGroup()", "CourseGroups/{courseCode?}/{groupCode?}")
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
            await saveLog("Error updating courseGroup by code: " + error.message, "Error", "createGroup()", "CourseGroups/{courseCode?}/{groupCode?}")
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

            const resp = Groups.deleteOne({ 'code': req.params.groupCode, 'users': { $eq: [] } })

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
            await saveLog(`Error deleting group by code: ${req.body.course.code}` + error.message, "Error", "deleteGroup()", "CourseGroups/{courseCode?}/{groupCode?}")
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

    const createQuizScore = async () => {
        delete req.body._id
        try {
            const db = await database
            const CourseGroups = db.collection('group')
            const groupPromise = CourseGroups.findOne({ 'code': req.body.groupCode })
            const group = await groupPromise
            // console.log(group)
            let indexFilteredUser: number
            let filteredUser = group.users.filter((user: any, index: number) => {
                if (user.code == req.body.studentCode) {
                    indexFilteredUser = index
                    return user
                }
            })
            let quizScores: any[]
            if (filteredUser.quizScores == undefined) {
                quizScores = [
                    {
                        quizCode: req.body.quizCode,
                        score: req.body.score
                    }
                ]
            } else {
                quizScores.push(
                    {
                        quizCode: req.body.quizCode,
                        score: req.body.score
                    }
                )
            }
            console.log(group)
            console.log('@@@@@@@@@@@@@@@@@@@@@')
            console.log(group.users)
            console.log('@@@@@@@@@@@@@@@@@@@@@')
            console.log(group.users[indexFilteredUser])
            console.log('@@@@@@@@@@@@@@@@@@@@@')
            console.log(group.users[indexFilteredUser].quizScores)
            console.log('@@@@@@@@@@@@@@@@@@@@@')
            console.log(indexFilteredUser)

            let quizScoresPath = group.users[indexFilteredUser].quizScores
            console.log(quizScoresPath)
            const updateGroupResponse = CourseGroups.findOneAndUpdate({ 'code': req.body.groupCode }, {
                $set: {
                    [quizScoresPath]: quizScores
                }
            })
            const body = await updateGroupResponse

            return
            // let quizScores = 
            if (group) {
                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": group
                }
            } else {
                await saveLog("Error updating courseGroup by code", "Error", "updateGroup()", "CourseGroups/{courseCode?}/{groupCode?}")
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
            await saveLog("Error creating quiz score: " + error.message, "Error", "addQuizScore()", "CourseGroups/{courseCode?}/{groupCode?}")
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

    switch (req.method) {
        case "POST":
            if (req.body.quizCode) {
                await createQuizScore()
                break;
            } else {
                await createGroup()
                break;
            }

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