import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { createContentTable } from "./createContentTable";

import { Db } from "mongodb";
import { createContentCycle } from "./cycle";

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
    const contentTable = req.body.contentTable

    console.info("req.body", req.body)

    try {

        db = await database
        const Courses = db.collection('course')
        const resp = Courses.findOne({ "code": courseCode })

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

    const addSections = (syllabus: {sectionTitle:string, numberElements: number}[], currentCourse: {}): {} => {
        syllabus.forEach(item => {
            const elements = (new Array(item.numberElements)).fill(
                {
                    "type": "Lección Engine",
                    "title": "Presentation",
                    "elementLesson": {
                        "lessonTheme": lessonTheme,
                        "paragraphs": []
                    }

                }
            )
            currentCourse["sections"].push(
                {
                    "title": item.sectionTitle,
                    "elements": elements
                }
            )
        })
        return currentCourse
    }

    switch (generationType) {

        case "generateByTitle":

            const syllabus = await createContentTable(courseTitle, maxSections, language, courseCode)

            if (syllabus) {

                const formattedSyllabus = syllabus.map(item => {
                    return {sectionTitle: item, numberElements: 1}
                })

                currentCourse = addSections(formattedSyllabus, currentCourse)

                createContentCycle(currentCourse)

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

        case "generateByStructure":

            if (contentTable) {

                const formattedContentTable: {sectionTitle: string, numberElements: number}[] = contentTable.map((item: {sectionTitle: string, numberElements: number})=> {
                    return {sectionTitle: item, numberElements: 1}
                })

                currentCourse = addSections(formattedContentTable, currentCourse)

                createContentCycle(currentCourse)

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

            case "docx":

                if (parsed) {

                    const formattedParsed = parsed.map((item: any) => {
                        return {sectionTitle: item.name, numberElements: item.lessons.length}
                    })

                    currentCourse = addSections(formattedParsed, currentCourse)

                    //createContentCycle(currentCourse)

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
                            "message": "Parsed does not exist"
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