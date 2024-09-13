import axios, { AxiosResponse } from "axios";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { createConnection } from "../shared/mongo";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import sharp = require("sharp");
import { v4 as uuidv4 } from "uuid";
import { saveLog } from "../shared/saveLog";
import { updateUserCreditConsumption } from "../shared/creditConsumption";

const database = createConnection();
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const deleteAssets = async (
    code: string,
    sectionIndex: number,
    elementIndex: number,
    slideIndex: number
  ) => {
    try {
      const db = await database;
      const Courses = db.collection("course");

      const resp = Courses.find({ code: code });
      const body = await resp.toArray();
      const audioUrl =
        body[0].sections[sectionIndex].elements[elementIndex].elementLesson
          .paragraphs[slideIndex].audioUrl;
      const urlParts = audioUrl.split("/");
      const containerName = urlParts[3];
      const audioFileName = urlParts[4];

      if (body && body[0]) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: { containerName, audioFileName },
        };
      } else {
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
        `Error deleting assets, error ${error.message}`,
        "Error",
        "deleteAssets()",
        "SlideResource"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting assets",
        },
      };
    }
  };

  const db = await database;
  const Courses = db.collection("course");

  const updateImage = async (
    courseCode: string,
    sectionIndex: number,
    elementIndex: number,
    slideIndex: number,
    thumbnailUrl: string,
    externalUrlImage: string
  ) => {
    try {
      const input = (
        await axios({ url: externalUrlImage, responseType: "arraybuffer" })
      ).data as Buffer;
      const output = await sharp(input).resize(1200, 675).jpeg().toBuffer();

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      const containerClient = blobServiceClient.getContainerClient("images");
      const blobName = uuidv4() + ".jpeg";
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(output, output.length);
      const imageField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData`;

      const resp = Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $set: {
            [imageField]: {
              thumb: {
                url: thumbnailUrl,
                width: -1,
                height: -1,
              },
              finalImage: {
                url: blockBlobClient.url,
                width: -1,
                height: -1,
              },
            },
          },
        }
      );

      let videoUrlField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData`;
      const updateResponse = Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $unset: { [videoUrlField]: "" },
        }
      );

      let remainingCredits = null;

      remainingCredits = await updateUserCreditConsumption(
        req.body.userCode,
        "eiv"
      );

      context.res = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: { url: blockBlobClient.url, remainingCredits: remainingCredits },
      };
    } catch (error) {
      await saveLog(
        `Error  updating an image, error ${error.message}`,
        "Error",
        "updateImage()",
        "SlideResource"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating image",
        },
      };
    }
  };

  const uploadResource = async (req: HttpRequest) => {
    try {
      const { fields, files } = await parseMultipartFormData(req);
      const courseCode = fields[0].value;
      const sectionIndex = fields[1].value;
      const elementIndex = fields[2].value;
      const slideIndex = fields[3].value;
      const resourceType = fields[4].value;
      const userCode = fields[5].value;

      const imageOrVideoFile = files[0];

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      let blobName = uuidv4();
      let containerClient: ContainerClient;
      let fieldKeyToUpdate: string;
      let bufferToUpload: Buffer;

      if (resourceType !== "video" && resourceType !== "image") {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Invalid `resourceType`",
          },
        };
        return;
      }

      if (resourceType === "video") {
        containerClient = blobServiceClient.getContainerClient("videos");
        blobName += ".mp4";
        bufferToUpload = imageOrVideoFile.bufferFile;
        fieldKeyToUpdate = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo.url`;
      } else {
        bufferToUpload = await sharp(imageOrVideoFile.bufferFile)
          .resize(1200, 675)
          .toFormat("webp")
          .toBuffer();
        containerClient = blobServiceClient.getContainerClient("images");
        blobName += ".webp";
        fieldKeyToUpdate = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData.finalImage.url`;
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(bufferToUpload, bufferToUpload.length);

      await Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $set: {
            [fieldKeyToUpdate]: blockBlobClient.url,
          },
        }
      );

      if (resourceType === "image") {
        const videoUrlField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo.url`;
        await Courses.findOneAndUpdate(
          { code: courseCode },
          {
            $set: {
              [videoUrlField]: "",
            },
          }
        );
      }

      let remainingCredits = null;

      remainingCredits = await updateUserCreditConsumption(userCode, "eiv");

      context.res = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: { url: blockBlobClient.url, remainingCredits: remainingCredits },
      };
    } catch (error) {
      await saveLog(
        `Error updating slide resource, error ${error.message}`,
        "Error",
        "uploadResource()",
        "SlideResource"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating slide resource",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      await uploadResource(req);
      break;

    case "DELETE":
      await deleteAssets(
        req.body.code,
        req.body.sectionIndex,
        req.body.elementIndex,
        req.body.slideIndex
      );
      break;

    case "PUT":
      await updateImage(
        req.body.courseCode,
        req.body.sectionIndex,
        req.body.elementIndex,
        req.body.slideIndex,
        req.body.thumbnailUrl,
        req.body.externalUrlImage
      );
      break;

    case "GET":
      if (req.params.courseCode) {
        //await getCourse(req.params.courseCode)
      } else {
        //await getCourses()
      }

      break;

    default:
      break;
  }
};

export default httpTrigger;
