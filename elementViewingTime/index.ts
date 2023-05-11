import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog";
import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    delete req.body._id
    try {
        return
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

        let elementTimePayload: any = {
            elementCode: req.body.elementCode,
            time: 15,
            status: ''
        }

        let elementTimePath
        // let elementTime

        if (filteredUser[0].elementTimes == undefined) {

            const updateGroupResponse = CourseGroups.findOneAndUpdate({ 'code': req.body.groupCode }, {
                $set: {
                    [elementTimePath]: elementTimePayload
                }
            })
            const body = await updateGroupResponse

        } else {

            let indexElementTime = filteredUser[0].elementTimes.filter((elementTime: any, indexElementTime: number) => {
                if (elementTime.code == req.body.elementCode) {
                    return indexElementTime
                }
            })
            console.log(filteredUser[0].elementTimes[indexElementTime])
        }

        const updateGroupResponse = CourseGroups.findOneAndUpdate({ 'code': req.body.groupCode }, {
            $set: {
                [elementTimePath]: elementTimePayload
            }
        })
        const body = await updateGroupResponse

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