import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()


 const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const createCourse = async () => {

        const createdCourses = parseInt(req.body.createdCourses)

        try {

            const db = await database
            const Courses = db.collection('course')
            const resp = Courses.insertOne(req.body.course)

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
                await saveLog(`Error creating course ${req.body.course.code}`, "Error", "createCourse()", "Courses/{courseCode?}")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error creating course"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error creating course: ${req.body.course.code}` + error.message, "Error", "createCourse()", "Courses/{courseCode?}")
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

    const getUserCourses = async () => {

        try {
            const db = await database
            const Courses = db.collection("course")
            const resp = Courses.aggregate([
                {
                    '$lookup': {
                        'from': 'user',
                        'localField': 'author_code',
                        'foreignField': 'code',
                        'as': 'createdBy'
                    }
                }, {
                    '$unwind': {
                        'path': '$createdBy'
                    }
                }, {
                    '$match': {
                        'createdBy.code': {
                            '$exists': true
                        }
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'dateCreated': '$dateCreated',
                        'company': '$createdBy.company',
                        'curso': '$details.title',
                        'criado_por': '$createdBy.name',
                        'email': '$createdBy.email'
                    }
                }, {
                    '$match': {
                        'company': {
                            '$not': {
                                '$eq': 'Edutecno'
                            }
                        }
                    }
                }, {
                    '$sort': {
                        'dateCreated': -1,
                        'company': 1
                        
                    }
                }, {
                    '$limit': 100
                }
            ])

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
                        "message": "No courses found"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error getting user courses, error ${error.message}`, "Error", "getUserCourses()", "Courses/{courseCode?}")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error getting courses"
                }
            }

        }
    }

    const updateCourse = async (courseCode: string) => {

        delete req.body._id

        try {

            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.findOneAndUpdate({ 'code': courseCode }, { $set: req.body })
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
                await saveLog(`Error updating course by code: ${req.body.course.code}` , "Error", "updateCourse()", "Courses/{courseCode?}")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error updating course by code"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error updating course by code: ${req.body.course.code}` + error.message, "Error", "updateCourse()", "Courses/{courseCode?}")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error updating course by code"
                }
            }

        }
    }

    const getCourse = async (courseCode: string) => {


        try {

            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.aggregate(
                [
                    {
                        '$match': {
                            'code': courseCode
                        }
                    },
                    {
                        $lookup: {
                            from: 'user',
                            localField: 'author_code',
                            foreignField: 'code',
                            as: 'createdBy'
                        }
                    }, {
                        $addFields: {
                            createdBy: '$createdBy.name'
                        }
                    }, {
                        $unwind: {
                            path: '$createdBy'
                        }
                    }
                ]
            )

            const body = await resp.toArray()

            if (body && body[0]) {

                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body[0]
                }
            } else {
                await saveLog(`Error getting course by code: ${req.body.course.code}` , "Error", "updateCourse()", "Courses/{courseCode?}")
                context.res = {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Error getting course by code"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error getting course by code: ${req.body.course.code} ` + error.message, "Error", "updateCourse()", "Courses/{courseCode?}")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error getting course by code"
                }
            }

        }
    }

    const getCourses = async (search: string, approvalStatus: string, categories: string, dateCreated: string, skip: string, items_by_page: string) => {

        try {

            const db = await database
            const collection = db.collection("course")

            const regexSearch = new RegExp(search, "i") // "i" indica que a busca é case-insensitive
            const querySearch  = { $or: [
                { 'code': { $regex: regexSearch } },
                { 'organizationCode': { $regex: regexSearch } },
                { 'author_code': { $regex: regexSearch } },
                { 'details.title': { $regex: regexSearch } },
                { 'details.summary': { $regex: regexSearch } }
            ]}
            
            const regexData = new RegExp(dateCreated, "i") 
            const queryData = { 'dateCreated': { $regex: regexData } }

            const regexStatus = new RegExp(approvalStatus, "i") 
            const queryStatus = { 'approvalStatus': { $regex: regexStatus } }

            const regexCategories = new RegExp(categories, "i") 
            const queryCategories = { 'details.categories': { $regex: regexCategories } }

            const skipNum = parseInt(skip)
            const limitNum = parseInt(items_by_page)

            const body = await collection.find(Object.assign(queryStatus, queryData, querySearch, queryCategories)).skip(skipNum).limit(limitNum).sort({'_id': -1}).toArray();

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
                        "message": "No course found"
                    }
                }

            }

        } catch (error) {
            await saveLog(`Error getting courses, error ${error.message}`, "Error", "getCourses()", "Courses/{courseCode?}")
            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error getting courses"
                }
            }

        }
    }


    const deleteCourse = async () => {
        try {
            const db = await database
            const Courses = db.collection('course')

            const resp = Courses.deleteOne({ 'code': req.params.courseCode })
            const body = await resp
            if (body) {
                context.res = {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": body
                }
            }
        } catch (error) {
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

    switch (req.method) {
        case "POST":
            await createCourse()
            break;

        case "PUT":
            await updateCourse(req.params.courseCode)
            break;

        case "DELETE":
            await deleteCourse()
            break;

        case "GET":
            if (req.params.courseCode) {
                await getCourse(req.params.courseCode)
            } else if (req.query.showCourses=="true") {
                await getUserCourses()
            } else {
                await getCourses(
                    req.query.search,
                    req.query.approvalStatus,
                    req.query.categories,
                    req.query.dateCreated,
                    req.query.skip,
                    req.query.items_by_page,
                    )
            }
            break;

        default:
            break;
    }


}

export default httpTrigger;

