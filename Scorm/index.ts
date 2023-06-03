import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import * as admZip from "adm-zip";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "../shared/mongo";
import { BlobServiceClient } from "@azure/storage-blob";
const fetch = require("node-fetch");
import { downloadTextElementAsDoc } from "../TextElement/download";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function createScorm(scormPayload: {
    courseTitle: string;
    lesson: any;
    sectionIndex: number;
    elementIndex: number;
    lessonCounter: number;
    courseCode: string;
  }): Promise<string | null> {
    const title = scormPayload.courseTitle;

    const organization_default =
      title.toLowerCase().replace(/ /g, "_") + "e_default_org";
    const base = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="com.scorm.golfsamples.runtime.basicruntime.12" version="1"
        xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
        xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                            http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                            http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
    </metadata>
          `;

    const organizations = `
    <organizations default="${organization_default}">
        <organization identifier="${organization_default}">
             <title>${title} - Run-time Basic Calls</title>
             <item identifier="item_1" identifierref="resource_1">
                  <title>${title}</title>
             </item>
        </organization>
    </organizations>
          `;

    const resources = {
      resource: {
        "@identifier": "resource_1",
        "@type": "webcontent",
        "@scormtype": "sco",
        "@href": "shared/launchpage.html",
        file: {},
      },
    };
    // faz o loop nos parágrafos e adiciona o caminho dos arquivos no manifest
    const paragraphs = scormPayload.lesson.elementLesson.paragraphs;

    // Verificar se há parágrafos disponíveis
    if (paragraphs.length === 0) {
      return null;
    }
    paragraphs.forEach((paragraph: any) => {
      const audioUrl = paragraph.audioUrl;
      const imageData = paragraph.imageData.finalImage.url;
      const audioHref = audioUrl.substring(audioUrl.indexOf("/speeches") + 1);
      const imageHref = imageData.substring(imageData.indexOf("/images") + 1);

      const newAudioFile = {
        "@href": audioHref,
      };
      const audioFileCount = Object.keys(resources.resource.file).length;
      resources.resource.file[`file_${audioFileCount}`] = newAudioFile;

      const newImageFile = {
        "@href": imageHref,
      };
      const imageFileCount = Object.keys(resources.resource.file).length;
      resources.resource.file[`file_${imageFileCount}`] = newImageFile;
    });

    const xmlString = `
    <resources>
      <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="shared/launchpage.html">
    
            ${Object.keys(resources.resource.file)
              .map(
                (key) =>
                  `<file href="${resources.resource.file[key]["@href"]}" />`
              )
              .join("\n  ")}
    
      </resource>
    </resources>
</manifest>
    `;

    const containerClient = blobServiceClient.getContainerClient("scorms");
    const newManifest = base + organizations + xmlString;

    const zipLesson = new admZip();

    zipLesson.addFile("imsmanifest.xml", Buffer.from(newManifest));

    // faz o loop nos parágrafos e adiciona os arquivos nas pastas
    for (let i = 0; i < paragraphs.length; i++) {
      const audioFile = paragraphs[i].audioUrl;
      const imageFile = paragraphs[i].imageData.finalImage.url;
      const urlAudio = audioFile.substring(audioFile.indexOf("/speeches") + 1);
      const urlImage = imageFile.substring(imageFile.indexOf("/images") + 1);

      const responseAudio = await fetch(audioFile);
      const responseImage = await fetch(imageFile);

      if (!responseAudio.ok || !responseImage.ok) {
        throw new Error("Failed to fetch audio or image file.");
      }

      const fileContentAudio = await responseAudio.buffer();
      const fileContentImage = await responseImage.buffer();

      zipLesson.addFile(urlAudio, Buffer.from(fileContentAudio));
      zipLesson.addFile(urlImage, Buffer.from(fileContentImage));
    }

    const zipBufferCourse = zipLesson.toBuffer();

    if (zipBufferCourse) {
      const LessonBlobName = `S${scormPayload.sectionIndex}-${scormPayload.courseCode}/Scorm-S${scormPayload.sectionIndex}-L${scormPayload.lessonCounter}.zip`;
      const blockBlobClient =
        containerClient.getBlockBlobClient(LessonBlobName);
      await blockBlobClient.upload(zipBufferCourse, zipBufferCourse.length);
    }
  }

  async function loadCourse(courseCode: string) {
    try {
      const db = await database;
      const Courses = db.collection("course");
      const resp = await Courses.findOne({ code: courseCode });

      const sectionCycle = async (sectionIndex: number) => {
        let lessonCounter = 1;
        const elementCycle = async (elementIndex: number) => {
          const element = resp.sections[sectionIndex].elements[elementIndex];

          if (element && element.type === "Lección Engine") {
            const scormPayload = {
              courseTitle: resp.details.title,
              lesson: element,
              sectionIndex: sectionIndex + 1,
              elementIndex: elementIndex + 1,
              lessonCounter: lessonCounter,
              courseCode: courseCode,
            };

            const response = await createScorm(scormPayload);
            console.log(response);
            lessonCounter++;
          } else if (element && element.type === "file") {
            const fileUrl = element.elementFile.url;
            const fileNameDB = element.elementFile.name;
            const fileName = fileNameDB.substring(
              fileNameDB.lastIndexOf("/") + 1
            );

            const response = await fetch(fileUrl);
            if (!response.ok) {
              throw new Error("Failed to fetch file.");
            }

            const fileContent = await response.buffer();

            const containerClient =
              blobServiceClient.getContainerClient("scorms");
            const LessonFileName = `S${
              sectionIndex + 1
            }-${courseCode}/${fileName}`;
            const blockBlobClient =
              containerClient.getBlockBlobClient(LessonFileName);
            await blockBlobClient.upload(fileContent, fileContent.length);
          } else if (element && element.type === "html") {
      

            const docUrl = await downloadTextElementAsDoc(
              courseCode,
              sectionIndex.toString(),
              elementIndex.toString()
            )

            console.info("docUrl-->", docUrl)
            console.info("sectionIndex.toString()-->",  sectionIndex.toString())
            console.info("elementIndex.toString()-->", elementIndex.toString())
            
          }

          if (elementIndex < resp.sections[sectionIndex].elements.length - 1) {
            await elementCycle(elementIndex + 1);
          } else {
            console.info("End of element cycle in:", elementIndex);

            if (sectionIndex < resp.sections.length - 1) {
              await sectionCycle(sectionIndex + 1);
            } else {
              console.info("End of section cycle in:", sectionIndex);
            }
          }
        };

        await elementCycle(0);
      };

      await sectionCycle(0);

      async function createZipCourse(
        containerName: string,
        zipFileName: string
      ): Promise<void> {
        const blobServiceClient = BlobServiceClient.fromConnectionString(
          AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient =
          blobServiceClient.getContainerClient(containerName);
        const zipCourse = new admZip();

        for await (const blob of containerClient.listBlobsFlat()) {
          if (!blob.name.startsWith("Course")) {
            const blobClient = containerClient.getBlobClient(blob.name);
            const downloadResponse = await blobClient.download();
            const buffer = await streamToBuffer(
              downloadResponse.readableStreamBody
            );
            zipCourse.addFile(blob.name, buffer);
          }
        }

        const zipBuffer = zipCourse.toBuffer();
        const zipBlobName = zipFileName;
        const blockBlobClient = containerClient.getBlockBlobClient(zipBlobName);
        await blockBlobClient.uploadData(zipBuffer);

        console.log(
          `Arquivo ZIP '${zipFileName}' salvo no container '${containerName}'`
        );
      }

      async function streamToBuffer(
        readableStream: NodeJS.ReadableStream
      ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          readableStream.on("data", (data: Uint8Array) => {
            chunks.push(data);
          });
          readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
          });
          readableStream.on("error", reject);
        });
      }
      await createZipCourse("scorms", `Course-${courseCode}.zip`)
        .then(() => {
          console.log("Arquivo ZIP criado e salvo com sucesso");
        })
        .catch((error) => {
          console.error("Erro ao criar e salvar o arquivo ZIP:", error);
        });

      async function deleteFolders(courseCode: string) {
        const containerClient = blobServiceClient.getContainerClient("scorms");

        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
          blobs.push(blob);
        }

        const folderNames = new Set<string>(); // Definindo o tipo explícito
        for (const blob of blobs) {
          const folderName = blob.name.split("/")[0] as string; // Verificação de tipo
          folderNames.add(folderName);
        }

        for (const folderName of folderNames) {
          // Verifique se o nome da pasta contém o courseCode
          if (folderName.includes(courseCode || ".pdf")) {
            for await (const blob of containerClient.listBlobsFlat({
              prefix: `${folderName}/`,
            })) {
              await containerClient.deleteBlob(blob.name);
              console.log(`Blob '${blob.name}' excluído com sucesso.`);
            }

            console.log(`Pasta '${folderName}' excluída com sucesso.`);
          }
        }
      }

      deleteFolders(courseCode)
        .then(() => {
          console.log("Pastas excluídas com sucesso.");
        })
        .catch((error) => {
          console.error("Erro ao excluir as pastas:", error);
        });
    } catch (error) {
      await saveLog(
        `Error creating scorm: ${req.body}` + error.message,
        "Error",
        "createScorm()",
        "Scorm"
      );
    }
  }
  switch (req.method) {
    case "POST":
      if (req.body.courseCode) {
        loadCourse(req.body.courseCode);
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/xml",
          },
          body: { message: "Start scorm creation" },
        };
      } else {
        // await createScorm(req.body.courseName, req.body.Urls);
      }

      break;

    default:
      break;
  }
};

export default httpTrigger;
