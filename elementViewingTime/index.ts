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
        let indexGroup = fetchedUser.groups.findIndex((group: any) => group.groupCode === req.body.groupCode)
        const currentGroup = fetchedUser.groups[indexGroup]
        let elementTimesArrayPath = `groups.${indexGroup}.elementTimes`

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