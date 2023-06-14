import { DocumentCreator } from "../shared/downloadElementAsDoc";
import { createConnection } from "../shared/mongo";
import axios, { AxiosResponse } from "axios";
import { Packer } from "docx";
import { BlobServiceClient } from "@azure/storage-blob";
import { saveLog } from "../shared/saveLog";
import { v4 as uuidv4 } from "uuid";

const database = createConnection();
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING

export  const downloadTextElementAsDoc = async (
    courseCode: string,
    indexSection: string,
    indexElement: string
  ): Promise<string> => {
    try {
      // console.log(req.query)
      const db = await database;
      const Courses = db.collection("course");
      let courseFindOnePromise = Courses.findOne({
        code: courseCode,
      });
      let course = await courseFindOnePromise;
      let textElement =
        course.sections[parseInt(indexSection)].elements[parseInt(indexElement)]
          .elementText;

      let textElementBuffer: Buffer;
      const documentCreatorResponse = new DocumentCreator();
      let textElementDocument: any;
      let imageBuffer = (
        await axios({
          url: textElement.cover,
          responseType: "arraybuffer",
          timeout: 15000,
        })
      ).data as Buffer;
      textElementDocument = documentCreatorResponse.createTextDocument(
        textElement,
        imageBuffer
      );

      await Packer.toBuffer(textElementDocument).then((buffer) => {
        // fs.writeFileSync("My Document.docx", buffer);
        textElementBuffer = buffer;
      });

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      const containerClient = blobServiceClient.getContainerClient("files");
      const blobName = uuidv4() + ".docx";
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(textElementBuffer, textElementBuffer.length);

      return blockBlobClient.url;
    } catch (error) {
      await saveLog(
        `Error downloading text element: ${error.message}`,
        "Error",
        "downloadTextElementAsDoc()",
        "TextElement"
      );
      return undefined
    }
  };