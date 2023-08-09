import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import { BlobServiceClient } from "@azure/storage-blob";
import sharp = require("sharp");
import { updateCourseDuration } from "../shared/updateCourseDuration";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const createCourse = async () => {
    const createdCourses = parseInt(req.body.createdCourses);

    try {
      const db = await database;
      const Courses = db.collection("course");
      const course = req.body.course;
      course.creationDate = new Date();
      const resp = Courses.insertOne(course);

      const body = await resp;

      if (body) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        await saveLog(
          `Error creating course ${req.body.course.code}`,
          "Error",
          "createCourse()",
          "Courses/{courseCode?}"
        );
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error creating course",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error creating course: ${req.body.course.code}` + error.message,
        "Error",
        "createCourse()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: error.toString(),
        },
      };
    }
  };

  const updateCourse = async (courseCode: string) => {
    delete req.body._id;

    try {
      const db = await database;
      const Courses = db.collection("course");
      const resp = Courses.findOneAndUpdate(
        { code: courseCode },
        { $set: req.body }
      );
      const body = await resp;

      if (req.query.updateCourseDuration) {
        updateCourseDuration(courseCode)
      }

      if (body) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        await saveLog(
          `Error updating course by code: ${courseCode}`,
          "Error",
          "updateCourse()",
          "Courses/{courseCode?}"
        );
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating course by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating course by code: ${courseCode}` + error.message,
        "Error",
        "updateCourse()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating course by code",
        },
      };
    }
  };


  const addCourseElement = async (courseCode: string) => {
    try {
      const db = await database;
      const Courses = db.collection("course");

      let elementPath = `sections.${req.query.indexSection}.elements`;

      // console.log(req.body)
      // return

      const resp = Courses.updateOne({ code: courseCode }, { $push: req.body });
      const body = await resp;

      if (body) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        await saveLog(
          `Error adding element. Course code: ${courseCode}`,
          "Error",
          "addCourseElement()",
          "Courses/{courseCode?}"
        );
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error adding element",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error adding element. Course code: ${courseCode}`,
        "Error",
        "addCourseElement()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error adding element",
        },
      };
    }
  };

  const getCourse = async (courseCode: string) => {
    try {
      const db = await database;
      const Courses = db.collection("course");

      const resp = Courses.aggregate([
        {
          $match: {
            code: courseCode,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "author_code",
            foreignField: "code",
            as: "createdBy",
          },
        },
        {
          $addFields: {
            createdBy: "$createdBy.name",
          },
        },
        {
          $unwind: {
            path: "$createdBy",
          },
        },
      ]);

      const body = await resp.toArray();

      if (body && body[0]) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        await saveLog(
          `Error getting course by code: ${courseCode}`,
          "Error",
          "updateCourse()",
          "Courses/{courseCode?}"
        );
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error getting course by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting course by code: ${courseCode} ` + error.message,
        "Error",
        "updateCourse()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting course by code",
        },
      };
    }
  };

  const getCoursesBySearch = async (query: any) => {
    try {
      console.log(new Date())
      const db = await database;
      const collection = db.collection("course");

      const queryOrganizationCode = query.organizationCode
        ? { organizationCode: query.organizationCode }
        : {};
      const queryAuthorCode = query.authorCode
        ? { author_code: query.authorCode }
        : {};

      const regexSearch = new RegExp(query.search, "i");
      const querySearch = {
        $and: [
          queryOrganizationCode,
          queryAuthorCode,
          {
            $or: [
              { code: { $regex: regexSearch } },
              { author_code: { $regex: regexSearch } },
              { "details.title": { $regex: regexSearch } },
              { "details.summary": { $regex: regexSearch } },
            ],
          },
        ],
      };

      const regexData = new RegExp(query.dateCreated, "i");
      const queryData = { dateCreated: { $regex: regexData } };

      const regexStatus = new RegExp(query.approvalStatus, "i");
      const queryStatus = { approvalStatus: { $regex: regexStatus } };

      // const regexCategories = new RegExp(query.categories, "i")
      // const queryCategories = { 'details.categories': { $regex: regexCategories } }

      const skipNum = parseInt(query.skip) ? parseInt(query.skip) : 0;
      const limitNum = parseInt(query.items_by_page)
        ? parseInt(query.items_by_page)
        : 1000;

      // const count = await collection
      //   .aggregate([
      //     {
      //       $facet: {
      //         organizationCount: [
      //           {
      //             $match: queryOrganizationCode,
      //           },
      //           {
      //             $count: "organizationCount",
      //           },
      //         ],
      //         authorCount: [
      //           {
      //             $match: queryAuthorCode,
      //           },
      //           {
      //             $count: "matchingCoursesCount",
      //           },
      //         ],
      //       },
      //     },
      //   ])
      //   .toArray();

      const body = await collection
        .aggregate([
          { $match: Object.assign(queryStatus, queryData, querySearch) },
          {
            $facet: {
              "Courses":
                [
                  { $sort: { _id: -1 } },
                  { $skip: skipNum },
                  { $limit: limitNum },
                ],
              "Count":
                [
                  {
                    $group: {
                      _id: null,
                      "Total": { $sum: 1 }
                    }
                  }
                ]
            }
          },
          {
            $addFields: {
              Count: "$Count.Total"
            }
          },
          {
            $unwind: "$Count"
          }
        ]
        )
        .toArray();

      // const result = {
      //   // matchingCoursesCount: count[0]?.authorCount[0]?.matchingCoursesCount || 0,
      //   body,
      // };

      if (body) {
        console.log(new Date())

        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "No course found",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting courses, error ${error.message}`,
        "Error",
        "getCourses()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting courses",
        },
      };
    }
  }

  const getAuthorCourses = async () => {
    try {
      const db = await database;
      const courses = db.collection("course")
      const query = { author_code: req.query.authorCode }
      const project = {
        projection: {
          _id: 0,
          "code": 1,
          "details.title": 1,
          "details.summary": 1,
          "details.cover": 1,
          "dateCreated": 1,
          "createdBy": 1,
          "approvalStatus": 1,
          "duration": 1
        }
      }
      console.log('Before query: ', new Date())
      const findResponse = await courses.find(query, project).sort({ "dateCreated": -1 })
        // .explain()
        .toArray()
      console.log('After query: ', new Date())
      if (findResponse) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: findResponse,
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "No course found",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting courses, error ${error.message}`,
        "Error",
        "getAuthorCourses()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting author courses",
        },
      };
    }
  }

  const getOrganizationCourses = async () => {
    try {
      const db = await database;
      const courses = db.collection("course")
      // const query = { organizationCode: req.query.organizationCode, approvalStatus: req.query.approvalStatus }
      // const project = {
      //   projection: {
      //     _id: 0,
      //     "code": 1,
      //     "details.title": 1,
      //     "details.summary": 1,
      //     "details.cover": 1,
      //     "dateCreated": 1,
      //     "createdBy": 1,
      //     "approvalStatus": 1
      //   }
      // }
      // console.log('Before query: ', new Date())
      // const findResponse = await courses.find(query, project).sort({ "dateCreated": -1 })
      //   // .explain()
      //   .toArray()
      // console.log('After query: ', new Date())

      console.log('Before aggregation: ', new Date())
      const aggregationResponse = await courses.aggregate([
        {
          $match: {
            organizationCode: req.query.organizationCode,
            approvalStatus: req.query.approvalStatus
          }
        },
        {
          $project: {
            "_id": 0,
            "code": 1,
            "details.title": 1,
            "details.summary": 1,
            "details.cover": 1,
            "dateCreated": 1,
            "createdBy": 1,
            "approvalStatus": 1,
            "duration": 1
          }
        },
        {
          $sort: {
            dateCreated: -1
          }
        },
        {
          $facet: {
            "Courses":
              [
                { $skip: parseInt(req.query.skip) },
                { $limit: 20 },
              ],
            "Count":
              [
                {
                  $group: {
                    _id: null,
                    "Total": { $sum: 1 }
                  }
                }
              ]
          }
        },
        {
          $addFields: {
            Count: "$Count.Total"
          }
        },
        {
          $unwind: "$Count"
        }
      ])
        .toArray()
      console.log('After aggregation: ', new Date())

      if (aggregationResponse) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: aggregationResponse[0],
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "No course found",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting courses, error ${error.message}`,
        "Error",
        "getOrganizationCourses()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting author courses",
        },
      };
    }
  }

  const getStudentCourses = async () => {
    try {
      const db = await database
      const Groups = db.collection('group')
      console.log(new Date())

      const body = await Groups.aggregate(
        // [
        //   {
        //     '$match': {
        //       'users.code': studentCode,
        //       'status': 'Activo'
        //     }
        //   }, {
        //     '$unwind': {
        //       'path': '$users'
        //     }
        //   }, {
        //     '$match': {
        //       'users.code': studentCode,
        //       'status': 'Activo'
        //     }
        //   },
        //   {
        //     '$lookup': {
        //       'from': 'course',
        //       'localField': 'courseCode',
        //       'foreignField': 'code',
        //       'as': 'courses'
        //     }
        //   },
        //   {
        //     '$unwind': {
        //       'path': '$courses'
        //     }
        //   },
        //   {
        //     '$project': {
        //       'course': '$courses',
        //       'groupCode': '$code',
        //       'quizScores': '$users.quizScores',
        //       'group': '$users'
        //     }
        //   },
        //   {
        //     '$match': {
        //       'course.approvalStatus': 'Approved'
        //     }
        //   }
        // ]
        [
          {
            '$match': {
              'users.code': req.query.studentCode
            }
          }, {
            '$lookup': {
              'from': 'course',
              'localField': 'courseCode',
              'foreignField': 'code',
              'as': 'course'
            }
          }, {
            '$match': {
              'course.approvalStatus': 'Approved'
            }
          }, {
            '$unwind': {
              'path': '$course'
            }
          }, {
            '$project': {
              '_id': 0,
              'course': 1,
              'group.name': '$name',
              'group.startDate': '$startDate',
              'group.endDate': '$endDate',
              'group.code': '$code'
            }
          }
        ]
      ).toArray()

      console.log('Last one', new Date())

      if (body) {
        context.res = {
          "status": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": body
        }
      } else {
        await saveLog(`Error getting courses by user code for user: ${req.query.studentCode}`, "Error", "getStudentCourses()", "Course/")

        context.res = {
          "status": 500,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "message": "Error getting courses by user code"
          }
        }
      }
    } catch (error) {
      await saveLog(`Error getting courses by user code for user: ${req.query.studentCode}, error ${error.message}`, "Error", "getStudentCourses()", "Course/")

      context.res = {
        "status": 500,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Error getting courses by user code"
        }
      }
    }
  }

  const deleteCourse = async () => {
    try {
      const db = await database;
      const Courses = db.collection("course");
      const findUsers = await Courses.aggregate([
        {
          $match: {
            code: req.params.courseCode,
          },
        },
        {
          $lookup: {
            from: "group",
            localField: "code",
            foreignField: "courseCode",
            as: "result",
          },
        },
      ]).toArray();
      if (
        findUsers.length > 0 &&
        findUsers[0].result.length > 0 &&
        findUsers[0].result.some((group: any) => group.users.length > 0)
      ) {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message:
              "The course cannot be removed because it has a user in a group.",
          },
        };
      } else {
        const resp = Courses.deleteOne({ code: req.params.courseCode });
        const body = await resp;
        if (body) {
          context.res = {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          };
        }
      }
    } catch (error) {
      await saveLog(
        `Error deleting course by code: ${req.body.course.code}` +
        error.message,
        "Error",
        "deleteCourse()",
        "Courses/{courseCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting course by code",
        },
      };
    }
  }

  const uploadCourseCover = async (req: HttpRequest) => {
    try {
      const db = await database;
      const Courses = db.collection("course");
      console.log("THIS RUNS");
      const { fields, files } = await parseMultipartFormData(req);
      console.log("THIS RUNS 2");
      const responseMessage = {
        fields,
        files,
      };
      const courseCode = responseMessage.fields[0].value;
      const output = responseMessage.files[0].bufferFile as Buffer;
      const compressedOutput = await sharp(output)
        .resize(1200, 675)
        .jpeg()
        .toBuffer();
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      const containerClient = blobServiceClient.getContainerClient("images");
      const blockBlobClient = containerClient.getBlockBlobClient(
        responseMessage.files[0].filename
      );
      await blockBlobClient.upload(compressedOutput, compressedOutput.length);
      let key = "details.cover";
      await Courses.updateOne(
        { code: courseCode },
        {
          $set: {
            [key]: blockBlobClient.url,
          },
        }
      );
    } catch (error) {
      await saveLog(
        `Error uploading course cover. ` + error.message,
        "Error",
        "uploadCourseCover()",
        "Courses"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error uploading course cover",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      if (req.query.postElement == "true") {
        await addCourseElement(req.params.courseCode);
      } else {
        await createCourse();
      }
      break;

    case "PUT":
      if (req.query.uploadCourseCover == "true") {
        await uploadCourseCover(req);
      } else {
        await updateCourse(req.params.courseCode);
        break;
      }

    case "DELETE":
      await deleteCourse();
      break;

    case "GET":
      if (req.params.courseCode) {
        await getCourse(req.params.courseCode)
      } else {
        if (req.query.search) {
          await getCoursesBySearch(req.query)
        } else {
          if (req.query.studentCode) {
            await getStudentCourses()
          } else if (req.query.authorCode) {
            await getAuthorCourses()
          } else if (req.query.organizationCode) {
            await getOrganizationCourses()
          }
        }
      }
      break;

    default:
      break;
  }
};

export default httpTrigger