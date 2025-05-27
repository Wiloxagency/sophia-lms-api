import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "../shared/mongo";
import { updateUserCreditConsumption } from "../shared/creditConsumption";
import { saveLog } from "../shared/saveLog";
import { CourseData, LessonSlideAsset } from "../shared/types";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import { saveFile } from "./../shared/SaveAssetsHD";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function createSlideAsset() {
    const { courseCode, sectionIndex, elementIndex, slideIndex } = req.params;
    const assetIndex = parseInt(req.params.assetIndex, 10);

    const assetPayload: LessonSlideAsset = req.body;

    try {
      const db = await database;
      const Courses = db.collection<CourseData>("course");
      const assetsPath = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets`;

      const resp = await Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $push: {
            [assetsPath]: {
              $each: [assetPayload],
              // $position: assetIndex,
            },
          },
        }
        // { returnDocument: "after" }
      );

      context.res = {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Slide asset created",
        },
      };
    } catch (error) {
      await saveLog(
        `Error  updating slide asset, error ${error.message}`,
        "Error",
        "createSlideAsset()",
        "SlideAsset"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Slide asset creation failed",
        },
      };
    }
  }

  async function uploadSlideAsset() {
    try {
      const { fields, files } = await parseMultipartFormData(req);
      const courseCode = fields[0].value;
      const sectionIndex = fields[1].value;
      const elementIndex = fields[2].value;
      const slideIndex = fields[3].value;
      const assetIndex = fields[4].value;
      const assetType = fields[5].value;
      const userCode = fields[6].value;
      const isSelfManageable = fields[7].value;

      const imageOrVideoFile = files[0];

      const db = await database;
      const Courses = db.collection("course");

      let fileName = uuidv4();
      let assetPath: string;
      let bufferToUpload: Buffer;
      let fileExtension: string;
      let uploadResponse: any;

      if (assetType !== "video" && assetType !== "photo") {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Invalid `assetType`",
          },
        };
        return;
      }

      if (assetType === "video") {
        fileExtension = ".mp4";
        fileName += fileExtension;
        bufferToUpload = imageOrVideoFile.bufferFile;
        assetPath = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets.${assetIndex}`;

        // Guardar video en HD usando saveFile
        uploadResponse = await saveFile(courseCode, fileName, bufferToUpload, "Videos");
      } else {
        bufferToUpload = await sharp(imageOrVideoFile.bufferFile)
          .resize({
            width: 1920,
            height: 1080,
            fit: 'inside', 
            withoutEnlargement: true, 
          })
          .toFormat("webp")
          .toBuffer();
        fileExtension = ".webp";
        fileName += fileExtension;
        assetPath = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets.${assetIndex}`;

        // Guardar imagen en HD usando saveFile
        uploadResponse = await saveFile(courseCode, fileName, bufferToUpload, "Images");
      }

      const assetPayload: LessonSlideAsset = {
        url: uploadResponse, // Usar la URL retornada por saveFile
        assetType: assetType,
        width: -1,
        height: -1,
        orientation: assetType === "photo" ? "landscape" : "portrait",
      };

      await Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $set: {
            [assetPath]: assetPayload,
          },
        }
      );

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
          url: uploadResponse,
          remainingCredits: remainingCredits
        },
      };
    } catch (error) {
      await saveLog(
        `Error uploading asset, error ${error.message}`,
        "Error",
        "uploadSlideAsset()",
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
      const Courses = db.collection<CourseData>("course");
      const assetField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets.${assetIndex}`;

      if (assetType === "photo") {
        const inputBuffer = (
          await axios({ url: assetUrl, responseType: "arraybuffer" })
        ).data as Buffer;
        const outputBuffer = await sharp(inputBuffer)
          .resize({
            width: 1920,
            height: 1080,
            fit: 'inside', // Mantiene el aspect ratio dentro del bounding box
            withoutEnlargement: true, // No agranda imágenes más pequeñas que el target
          })
          .jpeg()
          .toBuffer();

        const fileName = uuidv4() + ".jpeg";

        // Guardar imagen en HD usando saveFile
        const uploadResponse = await saveFile(courseCode, fileName, outputBuffer, "Images");
        uploadedAssetUrl = uploadResponse;
      } else if (assetType === "video") {
        uploadedAssetUrl = assetUrl;
      }

      const slideAssetPayload: LessonSlideAsset = {
        url: assetType === "photo" ? uploadedAssetUrl : assetUrl,
        assetType: assetType,
        width: assetType === "photo" ? 1200 : -1,
        height: assetType === "photo" ? 675 : -1,
        orientation: assetType === "photo" ? "landscape" : "portrait",
      };

      const resp = await Courses.findOneAndUpdate(
        { code: courseCode },
        {
          $set: {
            [assetField]: slideAssetPayload,
          },
        }
      );

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

  async function deleteSlideAsset() {
    const { courseCode, sectionIndex, elementIndex, slideIndex, assetIndex } =
      req.params;

    try {
      const db = await database;
      const Courses = db.collection<CourseData>("course");

      const updateQuery = {
        $unset: {
          [`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets.${assetIndex}`]:
            1 as 1, // Explicitly setting the type
        },
      };

      const cleanupQuery = {
        $pull: {
          [`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets`]:
            null,
        },
      };

      // Unset the slide first (set it to `null`)
      const updatedCourse = await Courses.findOneAndUpdate(
        { code: courseCode },
        updateQuery,
        { returnDocument: "after" }
      );

      if (!updatedCourse) {
        context.res = { status: 404, body: { message: "Course not found" } };
        return;
      }

      // Remove null values from the slides array
      await Courses.updateOne({ code: courseCode }, cleanupQuery);

      context.res = {
        status: 200,
        body: { message: "Slide asset deleted successfully" },
      };
    } catch (error) {
      await saveLog(
        `Error deleting slide asset, error ${error.message}`,
        "Error",
        "deleteSlideAsset()",
        "courses/{courseCode}/sections/{sectionIndex}/elements/{elementIndex}/slides/{slideIndex}/assets/{slideAsset}"
      );

      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { message: "Slide asset deletion failed" },
      };
    }
  }

  switch (req.method) {
    case "POST":
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        await uploadSlideAsset();
      } else {
        await createSlideAsset();
      }
      break;

    case "DELETE":
      await deleteSlideAsset();
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