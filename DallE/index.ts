import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import sharp = require("sharp");
import { saveLog } from "../shared/saveLog";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
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

    default:
      break;
  }
};

export default httpTrigger;
