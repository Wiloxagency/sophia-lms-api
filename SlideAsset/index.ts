import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";
import sharp from "sharp";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "../shared/mongo";
import { updateUserCreditConsumption } from "../shared/creditConsumption";
import { saveLog } from "../shared/saveLog";
import { LessonSlideAsset } from "../shared/types";
import parseMultipartFormData from "@anzp/azure-function-multipart";
const database = createConnection();

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function uploadResource() {
    const { fields, files } = await parseMultipartFormData(req);
    const courseCode = fields[0].value;
    const sectionIndex = fields[1].value;
    const elementIndex = fields[2].value;
    const slideIndex = fields[3].value;
    const assetIndex = fields[4].value;
    const resourceType = fields[5].value;
    const userCode = fields[6].value;
    const isSelfManageable = fields[7].value;

    const imageOrVideoFile = files[0];
    try {
      const db = await database;
      const Courses = db.collection("course");

      context.res = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        // body: { url: blockBlobClient.url, remainingCredits: remainingCredits },
      };
    } catch (error) {
      await saveLog(
        `Error  updating an image, error ${error.message}`,
        "Error",
        "updateImage()",
        "SlideAsset"
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
  }

  async function updateSlideAsset() {
    const { courseCode, sectionIndex, elementIndex, slideIndex, assetIndex } =
      req.params;
    const { assetUrl, assetType, isSelfManageable, userCode } = req.body;

    try {
      let uploadedAssetUrl: string;

      const db = await database;
      const Courses = db.collection("course");
      const assetField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets.${assetIndex}`;

      if (assetType === "photo") {
        const inputBuffer = (
          await axios({ url: assetUrl, responseType: "arraybuffer" })
        ).data as Buffer;
        const outputBuffer = await sharp(inputBuffer)
          .resize(1200, 675)
          .jpeg()
          .toBuffer();

        const blobServiceClient = BlobServiceClient.fromConnectionString(
          AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient("images");
        const blobName = uuidv4() + ".jpeg";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(outputBuffer, outputBuffer.length);
        uploadedAssetUrl = blockBlobClient.url;
      } else if (assetType === "video") {
        uploadedAssetUrl = assetUrl;
      }

      const slideAssetPayload: LessonSlideAsset = {
        url: assetType === "photo" ? uploadedAssetUrl : assetUrl,
        assetType: assetType,
        width: assetType === "photo" ? 1200 : -1,
        height: assetType === "photo" ? 675 : -1,
        orientation: assetType === "photo" ? "landscape" : "landscape",
      };

      const resp = await Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $set: {
            [assetField]: slideAssetPayload,
          },
        }
      );

      console.log(" resp: ", resp);

      let remainingCredits = null;

      if (isSelfManageable) {
        remainingCredits = await updateUserCreditConsumption(userCode, "eiv");
      }

      context.res = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          url: assetType === "photo" ? uploadedAssetUrl : assetUrl,
          remainingCredits: remainingCredits,
        },
      };
    } catch (error) {
      await saveLog(
        `Error  updating slide asset, error ${error.message}`,
        "Error",
        "updateSlideAsset()",
        "SlideAsset"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating slide asset",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      break;

    case "DELETE":
      break;

    case "PUT":
      await updateSlideAsset();
      break;

    case "GET":
      break;

    default:
      break;
  }
};

export default httpTrigger;
