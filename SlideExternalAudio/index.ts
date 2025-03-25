import parseMultipartFormData from "@anzp/azure-function-multipart";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { CourseData } from "../shared/types";
import { updateUserCreditConsumption } from "../shared/creditConsumption";
import { saveLog } from "../shared/saveLog";
const database = createConnection();

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { courseCode, sectionIndex, elementIndex, slideIndex } = req.params;

  try {
    const { fields, files } = await parseMultipartFormData(req);

    const isSelfManageable = fields[0].value;
    const userCode = fields[1].value;

    const imageOrVideoFile = files[0];

    const db = await database;
    const Courses = db.collection<CourseData>("course");

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    let blobName = uuidv4();
    let containerClient: ContainerClient;
    let externalAudioPath: string;
    let bufferToUpload: Buffer;

    containerClient = blobServiceClient.getContainerClient("audios");
    blobName += ".mp3";
    bufferToUpload = imageOrVideoFile.bufferFile;
    externalAudioPath = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.externalAudioUrl`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(bufferToUpload, bufferToUpload.length);

    await Courses.findOneAndUpdate(
      { code: courseCode },
      {
        $set: {
          [externalAudioPath]: blockBlobClient.url,
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
      body: { url: blockBlobClient.url, remainingCredits: remainingCredits },
    };
  } catch (error) {
    await saveLog(
      `Error uploading slide audio, error ${error.message}`,
      "Error",
      "SlideExternalAudio()",
      "SlideExternalAudio"
    );

    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Slide audio upload failed",
      },
    };
  }
};

export default httpTrigger;
