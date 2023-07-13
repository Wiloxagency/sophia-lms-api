import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import * as admZip from "adm-zip";
import { createConnection } from "../shared/mongo";
import { BlobServiceClient } from "@azure/storage-blob";
const fetch = require("node-fetch");
import { downloadTextElementAsDoc } from "../TextElement/download";
import { downloadQuiz } from "../Quiz/download";
import * as path from "path";
import { sendScormDownloadEmail } from "../nodemailer/scormDownloadEmail";

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

    const audioHrefList = [];
    const imageHrefList = [];

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

      audioHrefList.push(audioHref);
      imageHrefList.push(imageHref);
    });

    const newJsFile = {
      "@href": "js/engine.sophia.1.0.js",
    };
    const jsFileCount = Object.keys(resources.resource.file).length;
    resources.resource.file[`file_${jsFileCount}`] = newJsFile;

    const newJsonFile = {
      paragraphs: paragraphs.map((paragraph: any, index: number) => ({
        ...paragraph,
        audioUrl: audioHrefList[index],
        imageData: {
          ...paragraph.imageData,
          finalImage: {
            ...paragraph.imageData.finalImage,
            url: imageHrefList[index],
          },
        },
      })),
    };

    const jsCount = Object.keys(resources.resource.file).length;
    const jsonContent = JSON.stringify(newJsonFile);

    resources.resource.file[`file_${jsCount}`] = newJsonFile;
    const jsonFilePath = `lesson.json`;

    const xmlString = `
<resources>
  <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="shared/launchpage.html">

    ${Object.keys(resources.resource.file)
        .map((key) => `<file href="${resources.resource.file[key]["@href"]}" />`)
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
      zipLesson.addFile(jsonFilePath, Buffer.from(jsonContent));
    }

    const jsFolderPath = path.join("js");
    const jsFilePath = path.join(jsFolderPath, "engine.sophia.1.0.js");
    const newJsContent = `"use strict";(self.webpackChunkmy_project=self.webpackChunkmy_project||[]).push([[95],{7095:(s,a,_)=>{_.r(a),_.d(a,{AdminModule:()=>D,httpTranslateLoader:()=>E});var r=_(6895),l=_(4796),d=_(4763),o=_(4463),M=_(529),u=_(9832),m=_(4006),t=_(4650);let D=(()=>{class n{}return n.\u0275fac=function(P){return new(P||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[r.ez,l.c,d.Bz,m.u5,o.aw.forChild({loader:{provide:o.Zw,useFactory:E,deps:[M.eN]}})]}),n})();function E(n){return new u.w(n)}}}]);`;
    zipLesson.addFile(jsFilePath, Buffer.from(newJsContent));

    const zipBufferCourse = zipLesson.toBuffer();

    if (zipBufferCourse) {
      const LessonBlobName = `S${scormPayload.sectionIndex}-${scormPayload.courseCode}/Scorm-S${scormPayload.sectionIndex}-L${scormPayload.lessonCounter}.zip`;
      const blockBlobClient =
        containerClient.getBlockBlobClient(LessonBlobName);
      await blockBlobClient.upload(zipBufferCourse, zipBufferCourse.length);
    }
  }

  let numberLessons = 0;
  let numberRecourses = 0;

  async function saveScormDb(courseCode: string) {
    const db = await database;
    const Scorms = db.collection("scorm");
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const Courses = db.collection("course");
    const findCourse = await Courses.findOne({ code: courseCode });
    const authorCode = findCourse.author_code;
    const titleCourse = findCourse.details.title;

    const Users = db.collection("user");
    const findUser = await Users.findOne({ code: authorCode });
    const authorName = findUser.name;

    const scormData = {
      courseCode: courseCode,
      data_scorm: formattedDate,
      title: titleCourse,
      author_name: authorName,
      status: "building",
      content: `lessons: ${numberLessons}, recourses: ${numberRecourses}`,
      downloads: 0,
    };
    const query = {
      courseCode: scormData.courseCode,
    };
    const update = {
      $set: {
        courseCode: scormData.courseCode,
        data_scorm: scormData.data_scorm,
        title: scormData.title,
        author_name: scormData.author_name,
        status: scormData.status,
        downloads: scormData.downloads,
        content: `lessons: ${numberLessons}, recourses: ${numberRecourses}`,
      },
    };
    const options = { upsert: true };
    await Scorms.updateOne(query, update, options);
    console.info("scorm criado ou atualizado com sucesso.");
    await createInstructionsDoc(scormData);
  }

  let arquivo: string;
  async function createInstructionsDoc(scormData: {
    title: string;
    author_name: string;
    content: string;
  }) {
    const title = scormData.title;
    const authorName = scormData.author_name;
    const content = scormData.content;
    const doc = `Instruções de uso do zipCourse: 
    title: ${title}
    author: ${authorName}
    content: ${content}`;
    arquivo = doc;
  }

  async function updateScormStatus(courseCode: string) {
    const db = await database;
    const Scorms = db.collection("scorm");
    await Scorms.updateOne(
      { courseCode: courseCode },
      { $set: { status: "done" } }
    );
    console.info("status alterado com sucesso.");
  }

  async function loadCourse(courseCode: string) {
    try {
      const db = await database;
      const Courses = db.collection("course");
      const resp = await Courses.findOne({ code: courseCode });

      const elements = req.body.elements;
      const sectionCount = resp.sections.length;

      let sectionIndex = 0;
      let lessonCounter = 0;
      let htmlFileCount = 1;
      let quizFileCount = 1;
      numberLessons = 0;
      numberRecourses = 0;

      while (sectionIndex <= sectionCount - 1) {
        if (resp.sections[sectionIndex]) {
          const section = resp.sections[sectionIndex];
          const elementCount = section.elements.length;

          let elementIndex = 0;
          lessonCounter = 0;
          quizFileCount = 1;

          while (elementIndex <= elementCount) {
            const element = section.elements[elementIndex];

            const elementsToProcess = elements.filter(
              ([sectionIdx, elementIdx]) =>
                sectionIdx === sectionIndex && elementIdx === elementIndex
            );

            if (elementsToProcess.length > 0) {
              if (element.type === "Lección Engine") {
                const scormPayload = {
                  courseTitle: resp.details.title,
                  lesson: element,
                  sectionIndex: sectionIndex + 1,
                  elementIndex: elementIndex + 1,
                  lessonCounter: lessonCounter + 1,
                  courseCode: courseCode,
                };

                await createScorm(scormPayload);

                lessonCounter++;
                numberLessons++;
              } else if (element.type === "file") {
                const fileUrl = element.elementFile.url;
                const fileNameDB = element.elementFile.name;
                const fileName = fileNameDB.substring(
                  fileNameDB.lastIndexOf("/") + 1
                );

                const response = await fetch(fileUrl);
                if (!response.ok) {
                  throw new Error("Falha ao buscar o arquivo.");
                }

                const fileContent = await response.buffer();

                const containerClient =
                  blobServiceClient.getContainerClient("scorms");
                const LessonFileName = `S${sectionIndex + 1
                  }-${courseCode}/${fileName}`;
                const blockBlobClient =
                  containerClient.getBlockBlobClient(LessonFileName);
                await blockBlobClient.upload(fileContent, fileContent.length);
                numberRecourses++;
              } else if (element.type === "html") {
                if (element.elementText.content && element.elementText.cover) {
                  const docUrl = await downloadTextElementAsDoc(
                    courseCode,
                    sectionIndex.toString(),
                    elementIndex.toString()
                  );

                  docUrl.substring(docUrl.lastIndexOf("/") + 1);

                  const response = await fetch(docUrl);
                  if (!response.ok) {
                    throw new Error("Falha ao buscar o arquivo.");
                  }

                  const fileHtml = await response.buffer();

                  const containerClient =
                    blobServiceClient.getContainerClient("scorms");
                  const HtmlFileName = `S${sectionIndex + 1
                    }-${courseCode}/Text-S${sectionIndex + 1
                    }-T${htmlFileCount}.docx`;

                  const blockBlobClient =
                    containerClient.getBlockBlobClient(HtmlFileName);
                  await blockBlobClient.upload(fileHtml, fileHtml.length);
                  htmlFileCount++;
                } else {
                  const HtmlFileName = `S${sectionIndex + 1
                    }-T${htmlFileCount}.docx`;
                  console.log(
                    `Conteúdo HTML ${HtmlFileName} vazio. Ignorando...`
                  );
                }
                numberRecourses++;
              } else if (
                element.type === "shortAnswer" ||
                element.type === "trueOrFalse" ||
                element.type === "completion" ||
                element.type === "quizz"
              ) {
                const docUrlQuiz = await downloadQuiz(
                  courseCode,
                  sectionIndex.toString(),
                  elementIndex.toString()
                );

                docUrlQuiz.substring(docUrlQuiz.lastIndexOf("/") + 1);

                const response = await fetch(docUrlQuiz);
                if (!response.ok) {
                  throw new Error("Falha ao buscar o arquivo.");
                }

                const fileQuiz = await response.buffer();

                const containerClient =
                  blobServiceClient.getContainerClient("scorms");
                const QuizzFileName = `S${sectionIndex + 1
                  }-${courseCode}/Quiz-S${sectionIndex + 1
                  }-Q${quizFileCount}.docx`;
                const blockBlobClient =
                  containerClient.getBlockBlobClient(QuizzFileName);
                await blockBlobClient.upload(fileQuiz, fileQuiz.length);
                quizFileCount++;
                numberRecourses++;
              }
            }

            elementIndex++;
          }

          sectionIndex++;
        } else {
          console.error(
            `Seção ${sectionIndex} não encontrada em resp.sections`
          );
          sectionIndex++;
        }
      }

      await saveScormDb(req.body.courseCode);
      async function createZipCourse(
        containerName: string,
        zipFileName: string,
        arquivo: string
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
            zipCourse.addFile("instructions.docx", Buffer.from(arquivo));
          }
        }

        const zipBuffer = zipCourse.toBuffer();
        const zipBlobName = zipFileName;
        const blockBlobClient = containerClient.getBlockBlobClient(zipBlobName);
        await blockBlobClient.uploadData(zipBuffer);
        console.log(
          `Arquivo ZIP '${zipFileName}' salvo no container '${containerName}'`
        );

        console.log(req.params)
        sendScormDownloadEmail("Lexp2008@gmail.com", zipFileName)
        // sendScormDownloadEmail(req.params.userEmail, zipFileName)
      
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
      await createZipCourse("scorms", `Course-${courseCode}.zip`, arquivo)
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
          if (folderName.includes(courseCode || ".pdf" || ".docx")) {
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
      await updateScormStatus(courseCode);
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
