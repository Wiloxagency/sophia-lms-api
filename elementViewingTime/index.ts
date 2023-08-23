import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog";
import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    delete req.body._id
    try {
        const db = await database
        const Users = db.collection('user')
        const fetchedUser = await Users.findOne({ code: req.body.studentCode })
        const Courses = db.collection('course')
        const fetchedCourse = await Courses.findOne({ code: req.body.courseCode })
        // console.log(req.body)
        // console.log(fetchedCourse)
        let courseElementsCounter: number = 0
        let elementViewingTimeRegistriesCounter: number = 0

        for (let section of fetchedCourse.sections) {
            for (let element of section.elements) {
                if (
                    element.type == 'Lección Engine' ||
                    element.type == 'file' ||
                    element.type == 'video_url' ||
                    element.type == 'html'
                ) {
                    courseElementsCounter++
                }
            }
        }
        // console.log(courseElementsCounter)

        let indexGroup = fetchedUser.groups.findIndex((group: any) => group.groupCode === req.body.groupCode)
        const currentGroup = fetchedUser.groups[indexGroup]
        let elementTimesArrayPath = `groups.${indexGroup}.elementTimes`

        if (currentGroup.elementTimes) {
            elementViewingTimeRegistriesCounter = currentGroup.elementTimes.length
            // console.log(elementViewingTimeRegistriesCounter)
        }

        let elementTimesPayload: any =
        {
            elementCode: req.body.elementCode,
            time: 15,
            status: 'completed'
        }

        // 👇🏼 IF THERE AREN'T ANY TIME REGISTRIES
        if (currentGroup.elementTimes == undefined) {
            const updateGroupResponse = await Users.updateOne({ 'code': req.body.studentCode }, {
                $set: {
                    [elementTimesArrayPath]: [elementTimesPayload]
                }
            })
            elementViewingTimeRegistriesCounter = 1
            // console.log(updateGroupResponse)
        }
        else {
            let indexElementTime
            let indexElementTimeFilter = currentGroup.elementTimes.filter((elementTime: any, indexElement: number) => {
                if (elementTime.elementCode == req.body.elementCode) {
                    indexElementTime = indexElement
                    return
                }
            })
            // 👇🏼 IF ELEMENT HAS NO PREVIOUS ENTRY
            if (indexElementTime == undefined) {
                let elementTimePayload: any =
                {
                    elementCode: req.body.elementCode,
                    time: 15,
                    status: 'completed'
                }
                const updateGroupResponse = await Users.updateOne({ 'code': req.body.studentCode }, {
                    $push: {
                        [elementTimesArrayPath]: elementTimePayload
                    }
                })
                elementViewingTimeRegistriesCounter++
                // console.log(updateGroupResponse)
            } else {
                let singleElementTimePath = `groups.${indexGroup}.elementTimes.${indexElementTime}.time`
                const updateGroupResponse = await Users.updateOne({ 'code': req.body.studentCode }, {
                    $inc: {
                        [singleElementTimePath]: 15
                    }
                })
                // console.log(updateGroupResponse)
            }
        }

        let courseProgress = Math.floor(100 * elementViewingTimeRegistriesCounter / courseElementsCounter) + '%'
        // console.log(courseProgress)

        let updateCourseProgress = await Users.updateOne(
            {
                code: req.body.studentCode,
                "groups.groupCode": req.body.groupCode
            },
            {
                $set: { "groups.$.courseProgress": courseProgress }
            })

        console.log(updateCourseProgress)

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
        await saveLog(`Error updating element viewing time: ${req.body.course.code}` + error.message, "Error", "elementViewingTime()", "elementViewingTime/}")
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error updating element viewing time"
            }
        }
    }
}

export default httpTrigger;