import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { createContentTable } from "../shared/createContentTable";
import { Db } from "mongodb";

const database = createConnection()
var currentCourse = {}
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const courseCode = req.body.courseCode
    const generationType = req.body.type
    const courseTitle = req.body.courseTitle
    const voice = req.body.voice
    const parsed = req.body.parsed
    const autoBreak = req.body.autoBreak
    const maxSections = req.body.maxSections
    const maxParagraphs = req.body.maxParagraphs
    const language = req.body.language ? req.body.language : "es"
    const lessonTheme = req.body.lessonTheme

    try {

        db = await database
        const Courses = db.collection('course')
        const resp = Courses.findOne({ "code": courseCode})

        const body = await resp

        if (body) {
            currentCourse = body
        } else {
            context.res = {
                "status": 404,
                "headers": {
                    "Content-Type": "application/json"
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
                "message": "Error connecting to database"
            }
        }
    }

    switch (generationType) {

        case "generateByTitle":

            const syllabus = await createContentTable(courseTitle, maxSections, language)
            if (syllabus) {

                syllabus.forEach( item =>{
                    currentCourse["sections"].push(
                            {
                              "title": item,
                              "elements": [
                                {
                                  "type": "Lección Engine",
                                  "title": "Presentation",
                                  "lessonTheme": lessonTheme,
                                  "paragraphs": []
                                }
                              ]
                            }
                    )
                })

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": currentCourse
                }
            } else {
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating syllabus"
                    }
                }
            }

            break;

        default:
            context.res = {
                "status": 204,
                "headers": {
                    "Content-Type": "application/json"
                }
            }
            break;
    }


};

export default httpTrigger;