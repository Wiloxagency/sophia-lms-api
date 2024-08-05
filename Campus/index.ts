import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import sharp = require("sharp");

import parseMultipartFormData from "@anzp/azure-function-multipart";

import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { saveLog } from "../shared/saveLog";
import axios, { AxiosResponse } from "axios";

import { BlobInfo } from "../DeleteElement/types";
//import { DeleteResult } from "mongodb";



const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;


const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

//const imagesBlobContainerUrl =
//"https://sophieassets.blob.core.windows.net/assets/images/";

const database = createConnection();

export interface DeleteResult {
  success: boolean;
  count: number;
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {


  const createCampus = async () => {
    const { files } = await parseMultipartFormData(req);
    try {
      const db = await database;
      const Campuses = db.collection("campus");

      const file = Buffer.from(files[0].bufferFile);

      const campus = {};
      campus["code"] = req.headers.campuscode;
      campus["name"] = req.headers.name;
      campus["author_code"] = req.headers.authorcode;
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

          const urlBanner = await uploadBlobFromBuffer(req.headers.campuscode, file);
          
          if(urlBanner.ok){
            updateFreelanceFromCampus(req.headers.authorcode, req.headers.campuscode);
            
            const document = { "banner": urlBanner.body }
            const resp = Campuses.findOneAndUpdate(
              { code: req.headers.campuscode },
              { $set: document }
            );
          }else{
            context.res = {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "Error guardando imagen de banner",
              },
            };
          }

          
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


    //actualizar imagen del banner
    if (req.headers.image == "true") {
      const { files } = await parseMultipartFormData(req);
      //1 buscar imagen guardada
      //2 eliminar imagen guardada
      const containerClient = blobServiceClient.getContainerClient("marketplace");
      const deleteOk = await deleteBlobIfItExists(containerClient, req.headers.campuscode);

      if (deleteOk) {
        //3 guardar nueva imagen
        const file = Buffer.from(files[0].bufferFile);
        const uploadOk = await uploadBlobFromBuffer(req.headers.campuscode, file);

        if(uploadOk.ok){
          context.res = {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: "Imagen de banner actualizada exitosamente",
          };
        }else{
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: "No se pudo actualizar la imagen",
          };
        }
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: "No se pudo actualizar la imagen",
        };
      }
    } else {
      //para actualizar nombre u otro dato del campus
      try {
        const document = { "name": req.headers.name }
        const db = await database;
        const Campuses = db.collection("campus");
        const resp = Campuses.findOneAndUpdate(
          { code: req.headers.campuscode },
          { $set: document }
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
    }

  };

  const getCampus = async () => {

    var query: { author_code?: string; code?: string; };

    if (req.headers.authorcode) {
      query = {
        author_code: req.headers.authorcode
      }
    } else {
      query = {
        code: req.headers.campuscode
      }
    }

    try {
      const db = await database;
      const Campuses = db.collection("campus");

      const resp = Campuses.aggregate([
        {
          $match: query
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
      // if (req.query.courses == "true") {
      //  await getCoursesInstructor();
      //} else {
      await getCampus();
      //}

      break;

    default:
      break;
  }
};

async function updateFreelanceFromCampus(code: string, campusCode: string) {

  const document = { "campusCode": campusCode}
  try {
    const db = await database;
    const Users = db.collection("freelanceUser");
    const resp = Users.findOneAndUpdate(
      { code: code },
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

// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// buffer: blob contents as a buffer, for example, from fs.readFile()
async function uploadBlobFromBuffer(campusCode: string, buffer: Buffer) {
  try {
    const containerClient = blobServiceClient.getContainerClient("marketplace");
    const blobName = campusCode + ".jpg";//nombre del campus
    // Create blob client from container client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload buffer
    await blockBlobClient.uploadData(buffer);

    return {
      ok: true,
      body: blockBlobClient.url,
    };

    //return blockBlobClient.url
  } catch (error) {
    return {
      ok: false
    };
  }
}
async function deleteBlobIfItExists(containerClient: { getBlockBlobClient: (arg0: string) => any; }, campusCode: string) {
  try {
    // include: Delete the base blob and all of its snapshots.
    // only: Delete only the blob's snapshots and not the blob itself.
    const options = {
      deleteSnapshots: 'include' // or 'only'
    }

    const blobName = campusCode + ".jpg";//nombre del campus

    // Create blob client from container client
    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists(options);

    console.log(`deleted blob ${blobName}`);

    return true;
  } catch (error) {
    return false;
  }


}

export default httpTrigger
