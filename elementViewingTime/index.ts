import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog";
import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    delete req.body._id
    console.log(req.body)
    try {
        const db = await database
        const CourseGroups = db.collection('group')
        const groupPromise = CourseGroups.findOne({ 'code': req.body.groupCode })
        const group = await groupPromise
        let indexFilteredUser: number
        let filteredUser = group.users.filter((user: any, index: number) => {
            if (user.code == req.body.studentCode) {
                indexFilteredUser = index
                return user
            }
        })
        let elementTimePath
        // 👇🏼 IF THERE AREN'T ANY TIME REGISTRIES
        if (filteredUser[0].elementTimes == undefined) {
            let elementTimesPayload: any = [
                {
                    elementCode: req.body.elementCode,
                    time: 15,
                    status: 'completed'
                }
            ]
            elementTimePath = `users.${indexFilteredUser}.elementTimes`
            const updateGroupResponse = CourseGroups.findOneAndUpdate({ 'code': req.body.groupCode }, {
                $set: {
                    [elementTimePath]: elementTimesPayload
                }
            })
            const body = await updateGroupResponse
        }
        else {
            let indexElementTime
            let indexElementTimeFilter = filteredUser[0].elementTimes.filter((elementTime: any, indexElement: number) => {
                if (elementTime.elementCode == req.body.elementCode) {
                    indexElementTime = indexElement
                    return
                }
            })
            // 👇🏼 IF ELEMENT HAS NO PREVIOUS ENTRY
            if (indexElementTime == undefined) {
                elementTimePath = `users.${indexFilteredUser}.elementTimes`
                let elementTimes = filteredUser[0].elementTimes
                let elementTimePayload: any =
                    {
                        elementCode: req.body.elementCode,
                        time: 15,
                        status: 'completed'
                    }
                elementTimes.push(elementTimePayload)
                const updateGroupResponse = CourseGroups.findOneAndUpdate({ 'code': req.body.groupCode }, {
                    $set: {
                        [elementTimePath]: elementTimes
                    }
                })
                const body = await updateGroupResponse
            } else {
                elementTimePath = `users.${indexFilteredUser}.elementTimes.${indexElementTime}.time`
                let updatedTime = filteredUser[0].elementTimes[indexElementTime].time + 15
                const updateGroupResponse = CourseGroups.findOneAndUpdate({ 'code': req.body.groupCode }, {
                    $set: {
                        [elementTimePath]: updatedTime
                    }
                })
                const body = await updateGroupResponse
            }
        }
        context.res = {
            "status": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Request received"
            }
        }

    } catch (error) {
        // ⚠️👇🏼 ADAPT THIS
        await saveLog(`Error deleting course by code: ${req.body.course.code}` + error.message, "Error", "deleteCourse()", "Courses/{courseCode?}")
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

export default httpTrigger;