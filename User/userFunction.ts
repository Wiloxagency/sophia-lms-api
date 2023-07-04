import { userAggregation } from "./aggregation";
import bcrypt = require("bcryptjs");
import { saveLog } from "../shared/saveLog";
import { v4 as uuidv4 } from "uuid";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MongoClient } from "mongodb";

export const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {
  function hashPassword(textPassword: string): string {
    return bcrypt.hashSync(textPassword, 10);
  }

  const createUser = async () => {
    let newUser = req.body;
    try {
      const db = client.db();
      newUser.password = hashPassword(req.body.password);
      newUser["dataCreated"] = new Date();
      const Users = db.collection("user");
      const check = Users.findOne({ email: req.body.email });
      var body = null;
      body = await check;
      if (body) {
        return {
          status: 203,
          headers: {
            "Content-Type": "application/json",
          },
          body: { email: "Exists" },
        };
      } else {
        const resp = Users.insertOne(newUser);
        body = await resp;
        if (body.acknowledged) {
          const user = await Users.findOne({ _id: body.insertedId });
          delete newUser.password;
          return {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
            body: user,
          };
        }
      }
    } catch (error) {
      return {
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
    const byUserEmail = UserReq.query.userEmail
      ? { email: UserReq.query.userEmail }
      : {};

    // console.info(byUserCode, byUserEmail)
    try {
      const db = client.db();
      const Users = db.collection("user");
      const resp = Users.aggregate(userAggregation(byUserCode, byUserEmail));
      const body = await resp.toArray();
      if (body && body.length > 0) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        return {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const getUserByEmail = async () => {
    try {
      const db = client.db();
      const Users = db.collection("user");
      const resp = Users.findOne({ email: req.query.userEmail });
      const body = await resp;
      if (body) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        return {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const getUsers = async (organizationCode: string) => {
    let match = {};
    if (organizationCode) {
      match = { organizationCode: organizationCode };
    }
    try {
      const db = client.db();
      const Users = db.collection("user");
      const resp = Users.aggregate([
        {
          $match: match,
        },
        {
          $sort: { _id: -1 },
        },
      ]);
      const body = await resp.toArray();
      if (body && body.length > 0) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        return {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const updateUser = async (userCode: string) => {
    delete req.body._id;
    try {
      const db = client.db();
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
        return {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        return {
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
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const deleteUser = async () => {
    try {
      const db = client.db();
      const Users = db.collection("user");

      const resp = Users.deleteOne({ code: req.params.userCode });
      const body = await resp;
      if (body) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
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
    try {
      const db = client.db();
      const Users = db.collection("user");
      let addedFields = req.body.map((student: any) => {
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
    } catch (error: Error | any) {
      // console.log(error.writeErrors)
      if (error.code == 11000) {
        if (context.res) {
          context.res.status(201).json(error.writeErrors);
        }
      } else {
        ("Error");
        return {
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

  switch (req.method) {
    case "POST":
      if (req.query && req.query.excel === "true") {
        return await createUsersFromExcel();
      } else {
        return await createUser();
      }

    case "PUT":
      return await updateUser(req.params.userCode);

    case "GET":
      if (req.params.userCode || req.query.userEmail) {
        return await getUser(req);
      } else {
        return await getUsers(req.query.organizationCode);
      }

    case "DELETE":
      return await deleteUser();

    default:
      break;
  }
};

export default httpTrigger;
