import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { userAggregation } from "./aggregation";
//import bcrypt = require("bcrypt");
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
import { strict } from "assert";
import { v4 as uuidv4 } from "uuid";
import { sendValidationEmail } from "../nodemailer/sendMiscEmails";
import { returnEncryptedString } from "../shared/stringEncryption";

const FRONTEND_URL: string = process.env.FRONTEND_URL as string;

const database = createConnection();
var users = [];

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  function hashPassword(textPassword: string): string {
    return bcrypt.hashSync(textPassword, 10);
  }

  const createUser = async () => {
    // Remove isSelfManageable from user payload
    let { isSelfManageable, ...newUser } = req.body;
    try {
      const db = await database;
      newUser.password = hashPassword(req.body.password);
      newUser["dataCreated"] = new Date();
      const Users = db.collection("user");
      const check = Users.findOne({ email: req.body.email });
      var body = null;
      body = await check;
      if (body) {
        context.res = {
          status: 203,
          headers: {
            "Content-Type": "application/json",
          },
          body: { email: "Exists" },
        };
      } else {
        const insertNewUserResponse = await Users.insertOne(newUser);
        if (insertNewUserResponse.acknowledged) {
          const user = await Users.findOne({
            _id: insertNewUserResponse.insertedId,
          });
          delete user.password;

          const encryptedId = returnEncryptedString(
            String(insertNewUserResponse.insertedId)
          );

          const emailVerificationLink =
            (FRONTEND_URL === "localhost:4200" ? "http://" : "https://") +
            FRONTEND_URL +
            "/verification/" +
            encryptedId;

          if (req.body.isSelfManageable) {
            sendValidationEmail(
              req.body.email,
              req.body.name,
              emailVerificationLink
            );
          }

          context.res = {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
            body: user,
          };
        }
      }
    } catch (error) {
      await saveLog(
        `Error creating  user: ${req.body.email}, error ${error.message}`,
        "Error",
        "createUser()",
        "Users/{userCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Create user error",
      };
    }
  };

  const getUser = async (UserReq: HttpRequest) => {
    const byUserCode = UserReq.params.userCode
      ? { code: UserReq.params.userCode }
      : {};
    const byUserEmail = req.query.userEmail
      ? { email: req.query.userEmail }
      : {};
    // console.info(byUserCode, byUserEmail)
    try {
      const db = await database;
      const Users = db.collection("user");
      const resp = Users.aggregate(userAggregation(byUserCode, byUserEmail));
      const body = await resp.toArray();
      if (body && body.length > 0) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        context.res = {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting user: ${req.body.email}, error ${error.message}`,
        "Error",
        "getUser()",
        "Users/{userCode?}"
      );
    }
  };

  const getUserByEmail = async () => {
    try {
      const db = await database;
      const Users = db.collection("user");
      const resp = Users.findOne({ email: req.query.userEmail });
      const body = await resp;
      if (body) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        context.res = {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting user by email: ${req.body.email}, error ${error.message}`,
        "Error",
        "getUserByEmail()",
        "Users/{userCode?}"
      );
    }
  };

  const getUsers = async (query: any) => {
    try {
      const db = await database;
      const Users = db.collection("user");
      const queryOrganizationCode = query.organizationCode
        ? { organizationCode: query.organizationCode }
        : {};
      const regexSearch = new RegExp(query.search, "i"); // "i" indica que a busca é case-insensitive
      const querySearch = {
        $and: [
          queryOrganizationCode,
          {
            $or: [
              { name: { $regex: regexSearch } },
              { email: { $regex: regexSearch } },
              { code: { $regex: regexSearch } },
            ],
          },
        ],
      };
      const skipNum = parseInt(query.skip);
      const limitNum = parseInt(query.items_by_page);
      const body = await Users.find(
        Object.assign(
          querySearch
          // , queryCategories
        )
      )
        .sort({ _id: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .toArray();
      if (body) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        context.res = {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting users, error ${error.message}`,
        "Error",
        "getUsers()",
        "Users/{userCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get users",
      };
    }
  };

  const updateUser = async (userCode: string) => {
    delete req.body._id;
    try {
      const db = await database;
      const Users = db.collection("user");
      if (req.body.password) {
        req.body.password = hashPassword(req.body.password);
      }

      const resp = Users.findOneAndUpdate(
        { code: userCode },
        { $set: req.body }
      );
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
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating user by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating user: ${userCode} by code ${error.message}`,
        "Error",
        "updateUser()",
        "Users/{userCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating user by code",
        },
      };
    }
  };

  const deleteUser = async () => {
    try {
      const db = await database;
      const Users = db.collection("user");

      const resp = Users.deleteOne({ code: req.params.userCode });
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
    } catch (error) {
      await saveLog(
        `Error deleting user: ${req.params.userCode} `,
        "Error",
        "deleteUser()",
        "Users/{userCode?}"
      );
    }
  };

  async function createUsersFromExcel() {
    // 👇🏼 THIS CODE FINDS DUPLICATES
    // const db = await database
    // const Users = db.collection('user')
    // const resp = Users.aggregate(
    //     [
    //         {
    //             '$group': {
    //                 '_id': '$email',
    //                 'emailOccurrences': {
    //                     '$push': '$email'
    //                 }
    //             }
    //         }
    //     ]
    // )
    // const body = await resp.toArray()
    // let duplicatedUsers = body.filter((student: any) => {
    //     if (student.emailOccurrences.length == 1) {
    //         return student
    //     }
    // })
    // console.log(duplicatedUsers)
    // return

    // console.log(req.body)
    try {
      const db = await database;
      const Users = db.collection("user");
      let addedFields = req.body.map((student) => {
        return {
          name: student.Nombre,
          last_access: "",
          email: student.Email,
          role: "student",
          status: "active",
          code: uuidv4(),
          phone: student.Teléfono,
          company: req.query.company,
          position: student.Cargo,
          password: student.Email,
          language: req.query.language,
          organizationCode: req.query.organizationCode,
        };
      });
      // console.log(addedFields)
      const insertManyStudents = Users.insertMany(addedFields, {
        ordered: false,
      });
      await insertManyStudents;
      // try {
      //     await insertManyStudents
      // } catch (error) {
      //     console.log(error.code)
      //     if (error.code == 11000) {
      //         context.res.status(201).json(error.writeErrors)
      //     } else {
      //         context.res.status(500).json(error)
      //     }
      // }
    } catch (error) {
      // console.log(error.writeErrors)
      if (error.code == 11000) {
        context.res.status(201).json(error.writeErrors);
      } else {
        await saveLog(
          `Error uploading users.`,
          "Error",
          "createUsersFromExcel()",
          "Users"
        );
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating user by code",
          },
        };
      }
    }
  }

  const setQuizScore = async () => {
    delete req.body._id;
    try {
      const db = await database;
      const Users = db.collection("user");
      const fetchedUser = await Users.findOne({ code: req.body.studentCode });
      // console.log(fetchedUser)
      let indexGroup = fetchedUser.groups.findIndex(
        (group: any) => group.groupCode === req.body.groupCode
      );
      const currentGroup = fetchedUser.groups[indexGroup];
      let quizScoresArrayPath = `groups.${indexGroup}.quizScores`;

      let quizScorePayload: any = {
        quizCode: req.body.quizCode,
        score: req.body.score,
      };

      if (req.body.isQuizManuallyCorrected == false) {
        quizScorePayload.isQuizManuallyCorrected = false;
      }

      // 👇🏼 IF THERE AREN'T ANY QUIZ SCORE REGISTRIES
      if (currentGroup.quizScores == undefined) {
        if (req.body.isQuizManuallyCorrected == false) {
          quizScorePayload.isQuizManuallyCorrected = false;
        }
        const updateGroupResponse = await Users.updateOne(
          { code: req.body.studentCode },
          {
            $set: {
              [quizScoresArrayPath]: [quizScorePayload],
            },
          }
        );
        // console.log(updateGroupResponse)
      } else {
        let indexQuizScore;
        let indexElementTimeFilter = currentGroup.quizScores.filter(
          (quizScoreObject: any, indexElement: number) => {
            if (quizScoreObject.quizCode == req.body.quizCode) {
              indexQuizScore = indexElement;
              return;
            }
          }
        );
        // 👇🏼 IF ELEMENT HAS NO PREVIOUS ENTRY
        if (indexQuizScore == undefined) {
          // console.log('THIS RAN 1')
          const updateGroupResponse = await Users.updateOne(
            { code: req.body.studentCode },
            {
              $push: {
                [quizScoresArrayPath]: quizScorePayload,
              },
            }
          );
          // console.log(updateGroupResponse)
        } else {
          // console.log('THIS RAN 2')
          let singleQuizScorePath = `groups.${indexGroup}.quizScores.${indexQuizScore}`;
          const updateGroupResponse = Users.updateOne(
            { code: req.body.studentCode },
            {
              $set: {
                [singleQuizScorePath]: quizScorePayload,
              },
            }
          );
          // console.log(updateGroupResponse)
        }
      }
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Request received",
        },
      };
    } catch (error) {
      await saveLog(
        "Error creating quiz score: " + error.message,
        "Error",
        "addQuizScore()",
        "User/{userCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating courseGroup by code",
        },
      };
    }
  };

  const isUserAllowedToSeeCourse = async () => {
    try {
      const db = await database;
      const Users = db.collection("user");
      const Courses = db.collection("course");
      const fetchedUser = await Users.findOne({ code: req.query.userCode });
      let course;

      // console.log(req.query.userCode)
      // console.log(req.query.courseCode)
      // console.log(req.query.urlRoot)

      if (req.query.urlRoot == "instructor") {
        const organizationCode = fetchedUser.organizationCode;
        course = await Courses.findOne({
          code: req.query.courseCode,
          organizationCode: organizationCode,
        });
      } else if (req.query.urlRoot == "student") {
        let isUserMember = fetchedUser.groups.filter((group) => {
          return group.courseCode == req.query.courseCode;
        });
        if (isUserMember.length > 0) {
          course = "Allowed";
        }
      }
      if (course) {
        // console.log('THIS RAN 1')
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Allowed",
          },
        };
      } else {
        // console.log('THIS RAN 2')
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Not allowed",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error validating user: ${req.query.userCode}, error ${error.message}`,
        "Error",
        "isUserAllowedToSeeCourse()",
        "User/"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error validating user",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      if (req.query.isUserAllowedToSeeCourse) {
        await isUserAllowedToSeeCourse();
        break;
      } else if (req.query.excel == "true") {
        await createUsersFromExcel();
        break;
      } else if (req.body.quizCode) {
        await setQuizScore();
        break;
      } else {
        await createUser();
        break;
      }

    case "PUT":
      await updateUser(req.params.userCode);
      break;

    case "GET":
      if (req.params.userCode || req.query.userEmail) {
        await getUser(req);
      } else {
        await getUsers(req.query);
      }
      break;

    case "DELETE":
      await deleteUser();
      break;

    default:
      break;
  }
};

export default httpTrigger;
