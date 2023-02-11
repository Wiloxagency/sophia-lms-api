import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Db } from "mongodb";
import { createConnection } from "../shared/mongo";

const database = createConnection()
var db: Db

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const receivedCode = req.params.userCode

    try {

        db = await database
        const Users = db.collection('user')

        const totalStudents = Users.aggregate([
            {
                '$match': {
                    'code': receivedCode
                }
            }, {
                '$lookup': {
                    'from': 'groupUser',
                    'localField': 'code',
                    'foreignField': 'userCode',
                    'as': 'group'
                }
            }, {
                '$unwind': {
                    'path': '$group'
                }
            }, {
                '$project': {
                    'group': 1
                }
            }, {
                '$match': {
                    'group.userRole': 'Estudiante'
                }
            }, {
                '$count': 'total'
            }
        ])

        const totalInstructors = Users.aggregate([
            {
                '$match': {
                    'code': receivedCode
                }
            }, {
                '$lookup': {
                    'from': 'groupUser',
                    'localField': 'code',
                    'foreignField': 'userCode',
                    'as': 'group'
                }
            }, {
                '$unwind': {
                    'path': '$group'
                }
            }, {
                '$project': {
                    'group': 1
                }
            }, {
                '$match': {
                    'group.userRole': 'Instructor'
                }
            }, {
                '$count': 'total'
            }
        ])




        const estudiantes = await totalStudents.toArray()
        const instructores = await totalInstructors.toArray()

        const totalEst = estudiantes[0] ? estudiantes[0].total : 0
        const totalIns = instructores[0] ? instructores[0].total : 0

        if (estudiantes) {

            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": { estudiante: totalEst, instructor: totalIns }
            }


        } else {

            context.res = {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Error calculando totales"
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
                "message": "Error calculando totales"
            }
        }

    }



};

export default httpTrigger;