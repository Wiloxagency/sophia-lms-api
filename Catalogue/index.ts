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

  const createCatalogue = async () => {

    try {
      const db = await database;
      const Catalogues = db.collection("catalogue");
      var catalogue: OptionalId<Document>;
      catalogue = {};
      catalogue["dataCreated"] = new Date();
      catalogue["author_code"] = req.headers.authorcode;
      const course = {
        course_code: req.headers.coursecode,
        state: req.headers.state,
        value: req.headers.value,
      }
      catalogue["courses"] = [course];

      //validar si existe catalogo
      const exist = await Catalogues.findOne({ author_code: req.headers.authorcode });
      if (exist) {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error creating catalogue, the author: " + req.headers.authorcode + " already has a catalog",
          },
        };
      } else {

        const resp = Catalogues.insertOne(catalogue);

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
              message: "Error creating catalogue",
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

  const updateCatalogue = async () => {
    
    const course = {
      course_code: req.headers.coursecode,
      state: req.headers.state,
      value: req.headers.value,
    };
    try {
      const db = await database;
      const Catalogues = db.collection("catalogue");

      const resp = Catalogues.updateOne(
        { author_code: req.headers.authorcode },
        {
          $push: {
            courses: course
          }
        }
      )

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
            message: "Error updating catalogue by code",
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
          message: "Error updating catalogue by code",
        },
      };
    }
  };

  const getCatalogue = async () => {

    try {
      const db = await database;
      const Catalogues = db.collection("catalogue");

      const resp = Catalogues.aggregate([
        {
          $match: {
            author_code: req.headers.authorcode,
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
            message: "Error getting catalogue by code",
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
          message: "Error getting catalogue by code",
        },
      };
    }
  };

  const deleteCatalogue = async () => {
    try {
      const db = await database;
      const Catalogues = db.collection("catalogue");

      const resp = Catalogues.deleteOne({ author_code: req.headers.authorcode });
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
          message: "Error deleting catalogue by code",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      await createCatalogue();
      break;

    case "PUT":

      await updateCatalogue();
      break;

    case "DELETE":

      await deleteCatalogue();
      break;

    case "GET":

      await getCatalogue();
      break;

    default:
      break;
  }
};

export default httpTrigger
