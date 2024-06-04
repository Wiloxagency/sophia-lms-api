import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import sharp = require("sharp");

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const createCampus = async () => {

    try {
      const db = await database;
      const Campuses = db.collection("campus");
      const campus = req.body;
      campus["dataCreated"] = new Date();

      //validar si existe codigo
      const exist = await Campuses.findOne({ code: req.headers.campuscode });
      if (exist) {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error creating campus, code: " + req.headers.campuscode + " already exists",
          },
        };
      } else {

        const resp = Campuses.insertOne(campus);

        const body = await resp;

        if (body) {
          updateFreelanceFromCampus(req.headers.email,req.headers.campuscode);
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
              message: "Error creating campus",
            },
          };
        }
      }
    } catch (error) {
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

  const updateCampus = async () => {
    try {
      const db = await database;
      const Campuses = db.collection("campus");
      const resp = Campuses.findOneAndUpdate(
        { code: req.headers.campuscode },
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
            message: "Error 1 updating campus by code",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating campus by code",
        },
      };
    }
  };

  const getCampus = async () => {

    try {
      const db = await database;
      const Campuses = db.collection("campus");

      const resp = Campuses.aggregate([
        {
          $match: {
            code: req.query.campusCode,
          },
        }
      ]);

      const body = await resp.toArray();

      if (body[0]) {

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
            message: "Error getting campus by code",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting campus by code",
        },
      };
    }
  };


  const getCoursesInstructor = async () => {
    try {
      const db = await database;
      const courses = db.collection("course")
      const query = { author_code: req.headers.authorcode }
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
      const findResponse = await courses.find(query, project).sort({ "dateCreated": -1 })
        // .explain()
        .toArray()
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

  const deleteCampus = async () => {
    try {
      const db = await database;
      const Campuses = db.collection("campus");

      const resp = Campuses.deleteOne({ code: req.headers.campuscode });
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
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting campus by code",
        },
      };
    }
  }


  //crear coleccion campus en bd
  async function createColleccionCampus() {
    const db = await database;

    try {
      const resp = db.createCollection("campus");

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
            message: "Error creating collection campus",
          },
        };
      }


    } catch (error) {
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

  }

  switch (req.method) {
    case "POST":
      await createCampus();
      break;

    case "PUT":

      await updateCampus();
      break;

    case "DELETE":

      await deleteCampus();
      break;

    case "GET":
      if (req.query.courses == "true") {
        await getCoursesInstructor();
      } else {
        await getCampus();
      }

      break;

    default:
      break;
  }
};

async function updateFreelanceFromCampus (email:string, code:string) {
 
  const document = {"codeCampus": code}
  try {
    const db = await database;
    const Users = db.collection("freelanceUser");
    const resp = Users.findOneAndUpdate(
      { email: email },
      { $set: document }
    );

    const body = await resp;

    if (body) {
      return { 
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: body
      };
    } else {
      return { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating user freelance by email",
        }
      };
    }
  } catch (error) {
    return { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Error updating user freelance by email",
      }
    };
  }
};

export default httpTrigger
