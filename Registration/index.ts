import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import sharp = require("sharp");
import { OptionalId, Document } from "mongodb";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const createRegistration = async () => {

    try {
      const db = await database;
      const Registrations = db.collection("registration");
      var registration: OptionalId<Document>;
      registration = {};

      registration["studentcode"] = req.headers.studentcode;
      registration["coursecode"] = req.headers.coursecode;
      registration["value"] = req.headers.value;
      registration["dataCreated"] = new Date();

      //validar si existe registration
      const exist = await Registrations.findOne({ studentcode: req.headers.studentcode, coursecode: req.headers.coursecode });
      if (exist) {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error creating registration, the student: " + req.headers.studentcode + " already has a registration for this course",
          },
        };
      } else {

        const resp = Registrations.insertOne(registration);

        const body = await resp;

        if (body) {
          //updateFreelanceFromCatalogue(req.headers.authorcode, req.headers.cataloguecode);
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
              message: "Error creating registration",
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

  const updateRegistration = async () => {

    try {
      const db = await database;
      const Registrations = db.collection("registration");

      const resp = Registrations.updateOne(
        {
          studentcode: req.headers.studentcode,
          coursecode: req.headers.coursecode
        },
        {
          $set: req.body
        }
      )

      const body = await resp;

      if (body.matchedCount > 0) {
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
            message: "Error updating registration by code",
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
          message: "Error updating registration by code",
        },
      };
    }
  };

  const getRegistration = async () => {

    var match = {}
    var project = {}

    if(req.headers.studentcode != null){
      match["studentcode"] = req.headers.studentcode;
      project["_id"] = 0;
      project["coursecode"] = 1;
      project["value"] = 1;
      project["dataCreated"] = 1;
    }

    if(req.headers.coursecode != null){
      match["coursecode"] = req.headers.coursecode;
      project["_id"] = 0;
      project["studentcode"] = 1;
      project["value"] = 1;
      project["dataCreated"] = 1;
    }

    try {
      const db = await database;
      const Registrations = db.collection("registration");

      const resp = Registrations.aggregate([
        {
          $match: match
        },
        {
          $project: project
        }
      ]);

      const body = await resp.toArray();

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
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error getting registration by code",
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
          message: "Error getting registration by code",
        },
      };
    }
  };

  const deleteRegistration = async () => {
    try {
      const db = await database;
      const Registrations = db.collection("registration");

      const resp = Registrations.deleteOne({ studentcode: req.headers.studentcode, coursecode: req.headers.coursecode });

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
          message: "Error deleting registration by code",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      await createRegistration();
      break;

    case "PUT":

      await updateRegistration();
      break;

    case "DELETE":

      await deleteRegistration();
      break;

    case "GET":

      await getRegistration();
      break;

    default:
      break;
  }
};

export default httpTrigger
