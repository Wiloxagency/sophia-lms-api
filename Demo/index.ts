import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {


        try {
            const db = await database
            const Courses = db.collection("course")
            const resp = Courses.aggregate(
                [
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

};

export default httpTrigger;