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

    const getCourseGroups = async (courseCode: string) => {
        try {
            db = await database
            const Groups = db.collection('group')
            const resp = Groups.find({ courseCode: courseCode }).sort({ _id: -1 })
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
                await saveLog("Error getting groups by course ", "Error", "getGroups()", "CourseGroups/{courseCode?}/{groupCode?}")
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
            await saveLog("Error in CourseGroups method: " + error.message, "Error", "Group()", "CourseGroups/{courseCode?}/{groupCode?}")
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
                await saveLog("Error creating group", "Error", "createGroup()", "Group/{courseCode?}/{groupCode?}")
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
            await saveLog("Error creating group: " + error.message, "Error", "createGroup()", "Group/{courseCode?}/{groupCode?}")
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
            // console.log(req.body)
            // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
            // console.log(groupCode)
            const db = await database
            const Groups = db.collection('group')
            const Users = db.collection('user')

            const resp = Groups.findOneAndUpdate({ 'code': groupCode }, { $set: req.body })
            const body = await resp

            const groupPayload = {
                courseCode: req.body.courseCode,
                groupCode: groupCode,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
            }

            for (let user of req.body.users) {
                // console.log(userCode)
                const fetchedUser = await Users.findOne({ code: user.code })
                // console.log(fetchedUser)

                // 👇🏼 IF USER ALREADY HAS GROUPS
                if (fetchedUser.groups && fetchedUser.groups.length > 0) {
                    let isGroupAlreadyIncluded: boolean = false
                    for (let group of fetchedUser.groups) {
                        if (group.groupCode == groupCode) { isGroupAlreadyIncluded = true }
                    }
                    if (isGroupAlreadyIncluded) {
                        const updateUserGroup = await Users.updateOne(
                            {
                                code: user.code,
                                "groups.groupCode": groupCode
                            },
                            {
                                $set: {
                                    "groups.$.startDate": groupPayload.startDate,
                                    "groups.$.endDate": groupPayload.endDate
                                }
                            })
                        // console.log(updateUserGroup)
                    } else {
                        const pushUserGroup = await Users.updateOne(
                            {
                                code: user.code
                            },
                            {
                                $push: {
                                    "groups": groupPayload
                                }
                            })
                        // console.log('Push new group: ', pushUserGroup)
                    }

                } else {
                    const updateUser = await Users.updateOne({ code: user.code }, {
                        $set: {
                            groups: [groupPayload]
                        }
                    })
                    // console.log('Create group array: ', updateUser)
                }

            }
            // console.log(groupPayload)

            if (body) {
                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
                }
            } else {
                await saveLog("Error updating courseGroup by code", "Error", "updateGroup()", "Group/{courseCode?}/{groupCode?}")
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
            await saveLog("Error updating courseGroup by code: " + error.message, "Error", "createGroup()", "Group/{courseCode?}/{groupCode?}")
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
                    "status": 400,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "This group has students and cannot be deleted"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error deleting group by code: ${req.body.course.code}` + error.message, "Error", "deleteGroup()", "Group/{courseCode?}/{groupCode?}")
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

    const removeUserFromGroup = async () => {
        const db = await database
        const Users = db.collection('user')
        const Groups = db.collection('group')

        const findUserWithGroup = await Users.findOne({
            code: req.query.userCode,
            "groups.groupCode": req.query.groupCode
        })

        let indexGroup: number
        let indexGroupFilter = findUserWithGroup.groups.filter((group: any, indexElement: number) => {
            if (group.groupCode == req.query.groupCode) {
                indexGroup = indexElement
                return
            }
        })

        if (
            findUserWithGroup.groups[indexGroup].elementTimes ||
            findUserWithGroup.groups[indexGroup].quizScores
        ) {
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Can't remove user from group because he has saved progress"
                }
            }
        } else {
            // console.log('USER HAD NO ENTRIES IN GROUP')
            const removeGroupFromUser = await Users.updateOne(
                {
                    code: req.query.userCode
                },
                {
                    $pull: {
                        groups: {
                            groupCode: req.query.groupCode
                        }
                    }
                })
            // console.log(removeGroupFromUser)
            const removeUserFromGroup = await Groups.updateOne(
                {
                    code: req.query.groupCode
                },
                {
                    $pull: {
                        users: {
                            code: req.query.userCode
                        }
                    }
                }
            )
            // console.log(removeUserFromGroup)
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "User was removed from group"
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
            await getCourseGroups(req.query.courseCode)
            break;

        case "DELETE":
            if (req.query.userCode) {
                await removeUserFromGroup()
            } else {
                await deleteGroup()
                break;
            }

        default:
            break;
    }

}

export default httpTrigger;