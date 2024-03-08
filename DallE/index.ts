import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import sharp = require("sharp");
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import type { ParsedField } from "@anzp/azure-function-multipart/dist/types/parsed-field.type";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const db = await database;
  const Courses = db.collection("course");

  const createImages = async (courseCode: string) => {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: req.body.prompt,
        // prompt: "a white siamese cat",
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
      });

      const imageBuffer = Buffer.from(response.data[0].b64_json, "base64");

      const processedSquareImage = await ProcessSquareImage(
        imageBuffer,
        courseCode
      );

      context.res = {
        status: 201,
        headers: {
          "Content-Type": "image/webp",
        },
        body: processedSquareImage,
      };
    } catch (error) {
      await saveLog(
        `Error creating image with DallE for course: ${courseCode}, error: ${error.message} `,
        "Error",
        "createImages()",
        "DallE"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error creating image",
        },
      };
    }
  };

  const updateImage = async () => {
    try {
      const { fields, files } = await parseMultipartFormData(req);

      const { courseCode, sectionIndex, elementIndex, slideIndex } =
        getFieldsAsObject(fields);
      const image = files.find((file) => file.name === "image");

      if (typeof courseCode !== "string") {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message:
              '"courseCode" text field is missing or has an invalid value.',
          },
        };
        return;
      }

      if (!image) {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: 'Form data is missing "image" file field.',
          },
        };
        return;
      }

      const isImageFile = image.mimeType.startsWith("image/");
      if (!isImageFile) {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: '"image" file field is not an image.',
          },
        };
        return;
      }

      const shouldUpdateSlide =
        typeof sectionIndex === "number" &&
        typeof elementIndex === "number" &&
        typeof slideIndex === "number";

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      const containerClient = blobServiceClient.getContainerClient("images");
      const blobName = uuidv4() + ".jpeg";
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(image.bufferFile, image.bufferFile.length);
      if (shouldUpdateSlide) {
        const imageField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData.finalImage.url`;
        const resp = Courses.findOneAndUpdate(
          { code: courseCode },
          {
            $set: {
              [imageField]: blockBlobClient.url,
            },
          }
        );
      } else {
        const resp = Courses.findOneAndUpdate(
          { code: courseCode },
          {
            $set: {
              "details.cover": blockBlobClient.url,
            },
          }
        );
      }
      context.res = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: { imageUrl: blockBlobClient.url },
      };
    } catch (error) {
      await saveLog(
        `Error creating image with DallE for course, error: ${error.message} `,
        "Error",
        "updateImage()",
        "DallE"
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

  async function ProcessSquareImage(imageBuffer: Buffer, courseCode: string) {
    try {
      let foregroundImageBuffer = await sharp(imageBuffer)
        .resize({
          width: 1024,
          height: 576,
          fit: "contain",
          position: "center",
          background: { r: 255, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      let backgroundImageBuffer = await sharp(imageBuffer)
        .blur(10)
        .resize({
          width: 1024,
          height: 576,
          fit: "cover",
          position: "center",
        })
        .toBuffer();
      let composite = await sharp(backgroundImageBuffer)
        .composite([{ input: foregroundImageBuffer }])
        .toFormat("webp")
        .toBuffer();
      return composite;
    } catch (error) {
      await saveLog(
        `Error creating image with DallE for course: ${courseCode}, error: ${error.message} `,
        "Error",
        "ProcessSquareImage()",
        "DallE"
      );
    }
  }

  switch (req.method) {
    case "POST":
      await createImages(req.body.courseCode);
      break;

    case "PUT":
      await updateImage();
      break;

    default:
      break;
  }
};

function getFieldsAsObject(fields: ParsedField[]) {
  const fieldsObject: Record<string, unknown> = {};
  for (const field of fields) {
    fieldsObject[field.name] = field.value;
  }

  return fieldsObject;
}

export default httpTrigger;
