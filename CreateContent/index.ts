import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { createContentTable } from "./createContentTable";
import { v4 as uuidv4 } from "uuid"
import { Db } from "mongodb";
import { createContentCycle } from "./cycle";
import { saveLog } from "../shared/saveLog";

const database = createConnection()
var currentCourse: any = {}
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const courseCode = req.body.courseCode
    const generationType = req.body.type
    const courseTitle = req.body.courseTitle
    const courseDescription = req.body.courseDescription
    const voice = req.body.voice
    const parsed = req.body.parsed
    const autoBreak = req.body.autoBreak
    const maxSections = req.body.maxSections
    const maxParagraphs = req.body.maxParagraphs
    const language = req.body.language ? req.body.language : "es-MX"
    const languageName = req.body.languageName ? req.body.languageName : "Spanish"
    const lessonTheme = req.body.lessonTheme
    const contentTable = req.body.contentTable
    const vectorStoreId = req.body.vectorStoreId

    console.info("req.body", req.body)

    try {

        db = await database
        const Courses = db.collection('course')
        const resp = Courses.findOne({ "code": courseCode })

        const body = await resp

        if (body) {
            currentCourse = body
        } else {
            await saveLog(`Course not found: ${courseCode}.`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
            context.res = {
                "status": 404,
                "headers": {
                    "Content-Type": "application/json"
                }
            }

        }

    } catch (error) {
        await saveLog(`Error connecting to database ${courseCode}: ${error.message}`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
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

    const addSections = (syllabus: string[], currentCourse: {}): {} => {
        syllabus.forEach(item => {
            currentCourse["sections"].push(
                {
                    "title": item,
                    "elements": [
                        {
                            "type": "Lección Engine",
                            "title": "Presentation",
                            "elementCode": uuidv4(),
                            "elementLesson": {
                                "lessonTheme": lessonTheme,
                                "paragraphs": []
                            }

                        }
                    ]
                }
            )
        })
        return currentCourse
    }



    const addWordSections = (currentCourse: {}): {} => {

        let sections = []
        parsed.forEach((section: any) => {
            let lessons = []
            section.lessons.forEach((lesson: any) => {
                let paragraphs = []
                lesson.paragraphs.forEach((paragraph: any, paragraphIndex: number) => {
                    const content = paragraphIndex == 0 ? lesson.lessonTitle + ": " + paragraph.content : paragraph.content
                    paragraphs.push(content)
                });
                lessons.push(
                    {
                        "type": "Lección Engine",
                        "title": "Presentation",
                        "elementCode": uuidv4(),
                        "elementLesson": {
                            "lessonTheme": lessonTheme,
                            "paragraphs": paragraphs
                        }
                    }
                )
            })
            sections.push(
                {
                    "title": section.sectionTitle,
                    "elements": lessons
                }
            )
        })
        currentCourse["sections"] = sections


        return currentCourse

    }

    const addDocumentsSections = (currentCourse: {}): {} => {

        const structure = parsed.split("\n")
        let sections = []
        structure.forEach((section: string) => {
            let lessons = [{
                "type": "Lección Engine",
                "title": "Presentation",
                "elementCode": uuidv4(),
                "elementLesson": {
                    "lessonTheme": lessonTheme,
                    "paragraphs": []
                }
            }]

            sections.push(
                {
                    "title": section,
                    "elements": lessons
                }
            )
        })
        currentCourse["sections"] = sections
        

        return currentCourse

    }

    switch (generationType) {

        case "generateByTitle":

            const syllabus = await createContentTable(courseTitle, maxSections, languageName, courseCode, courseDescription)

            if (syllabus) {

                currentCourse = addSections(syllabus, currentCourse)
                //currentCourse["createAvatarIntro"] = req.body.createAvatarIntro


                currentCourse.language = language
                currentCourse.languageName = languageName
                currentCourse.voice = voice

                createContentCycle(currentCourse, 0, 0)

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": { syllabus: syllabus, currentCourse: currentCourse }
                }



            } else {
                await saveLog(`Error creating syllabus for course: ${courseCode}.`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
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

                currentCourse = addSections(contentTable, currentCourse)
                //currentCourse["createAvatarIntro"] = req.body.createAvatarIntro

                currentCourse.language = language
                currentCourse.languageName = languageName
                currentCourse.voice = voice

                createContentCycle(currentCourse, 0, 0)

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": currentCourse
                }


            } else {
                await saveLog(`Error creating by structure for course: ${courseCode}.`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating course by structure"
                    }
                }
            }

            break;


        case "docx":

            if (parsed) {

                currentCourse = addWordSections(currentCourse)

                console.info(currentCourse)

                //currentCourse["createAvatarIntro"] = req.body.createAvatarIntro

                currentCourse.language = language
                currentCourse.languageName = languageName
                currentCourse.voice = voice
                

                console.info(currentCourse)

                createContentCycle(currentCourse, 0, 0)

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": currentCourse
                }


            } else {
                await saveLog(`Error creating docx content for course: ${courseCode}.`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating docx content"
                    }
                }
            }

            break;

        case "generatedByDocuments":
            if (parsed) {

                console.info(currentCourse)
                currentCourse = addDocumentsSections(currentCourse)

                //currentCourse["createAvatarIntro"] = req.body.createAvatarIntro

                currentCourse.language = language
                currentCourse.languageName = languageName
                currentCourse.voice = voice
                currentCourse.vectorStoreId = vectorStoreId
                currentCourse.type = generationType

                console.info(currentCourse)

                createContentCycle(currentCourse, 0, 0)

                context.res = {
                    "status": 201,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": currentCourse
                }


            } else {
                await saveLog(`Error creating content by documents for course: ${courseCode}.`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating content by documents"
                    }
                }
            }

            break;

        //if (typeof variable === 'string')
        case "resume":
            currentCourse.type = "resume"
            try {
                let found = false
                for (let sectionIndex = 0; sectionIndex < currentCourse.sections.length; sectionIndex++) {
                    const elements = currentCourse.sections[sectionIndex].elements
                    for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                        if ((elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length == 0) ||
                            (elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length > 0 && typeof elements[elementIndex].elementLesson.paragraphs[0] === 'string')) {
                            createContentCycle(currentCourse, sectionIndex, elementIndex)
                            context.res = {
                                "status": 201,
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "body": {
                                    "msg": `Starting resume at Section ${sectionIndex}, Lesson ${elementIndex}`
                                }
                            }
                            found = true
                            break
                        }
                    }
                }
                if (!found) {
                    context.res = {
                        "status": 204,
                        "headers": {
                            "Content-Type": "application/json"
                        }
                    }
                }
            } catch (error) {
                await saveLog(`Error resuming course: ${courseCode}, error: ${error.message}`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating docx content"
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