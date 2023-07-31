import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import * as admZip from "adm-zip";
import { createConnection } from "../shared/mongo";
import { BlobServiceClient } from "@azure/storage-blob";
import fetch from 'node-fetch';
import { downloadTextElementAsDoc } from "../TextElement/download";
import { downloadQuiz } from "../Quiz/download";
import * as path from "path";
import { sendFailedSCORMCreationEmail, sendScormDownloadEmail } from "../nodemailer/scormDownloadEmail";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

const database = createConnection();
var errorLine = 19

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  errorLine = 25

  async function createScorm(scormPayload: {
    courseTitle: string;
    lesson: any;
    sectionIndex: number;
    elementIndex: number;
    lessonCounter: number;
    courseCode: string;
  }): Promise<string | null> {
    const title = scormPayload.courseTitle;
    errorLine = 35
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
        "@href": "index.html",
        file: {},
      },
    };
    // faz o loop nos parágrafos e adiciona o caminho dos arquivos no manifest
    const paragraphs = scormPayload.lesson.elementLesson.paragraphs;
    errorLine = 74
    // Verificar se há parágrafos disponíveis
    if (paragraphs.length === 0) {
      return null;
    }
    const audioHrefList = [];
    const imageHrefList = [];

    paragraphs.forEach((paragraph: any) => {
      const audioUrl = paragraph.audioUrl;
      const imageData = paragraph.imageData.finalImage.url;
      const videoUrl = paragraph.videoData.finalVideo.url;

      if (imageData === "" && videoUrl === "") {
        return;
      }


      if (audioUrl === "") {
        return;
      }

      // Audio process
      const audioHref = audioUrl.substring(audioUrl.indexOf("/speeches") + 1);
      const newAudioFile = {
        "@href": "./" + audioHref,
      };
      const audioFileCount = Object.keys(resources.resource.file).length;
      resources.resource.file[`file_${audioFileCount}`] = newAudioFile;
      audioHrefList.push("./" + audioHref);

      // Images process
      //if (imageData !== "") {
        const imageHref = imageData.substring(imageData.indexOf("/images") + 1);
        const newImageFile = {
          "@href": "./" + imageHref,
        };
        const imageFileCount = Object.keys(resources.resource.file).length;
        resources.resource.file[`file_${imageFileCount}`] = newImageFile;
        imageHrefList.push("./" + imageHref);
      //}
    });

    const newJsFile = {
      "@href": "./js/engine.js",
    };
    const jsFileCount = Object.keys(resources.resource.file).length;
    resources.resource.file[`file_${jsFileCount}`] = newJsFile;
    errorLine = 109
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

    const jsonContent = JSON.stringify(newJsonFile);
    const jsonFilePath = `./assets/lesson.json`;
    errorLine = 129
    const addLessonManifest = { "@href": jsonFilePath };
    const jsJsonCountLesson = Object.keys(resources.resource.file).length;
    resources.resource.file[`file_${jsJsonCountLesson}`] = addLessonManifest;

    const xmlString = `
<resources>
  <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">

    ${Object.keys(resources.resource.file)
        .map((key) => `<file href="${resources.resource.file[key]["@href"]}" />`)
        .join("\n  ")}

  </resource>
</resources>
</manifest>
`;
    errorLine = 142
    const containerClient = blobServiceClient.getContainerClient("scorms");
    const newManifest = base + organizations + xmlString;

    const zipLesson = new admZip();

    zipLesson.addFile("imsmanifest.xml", Buffer.from(newManifest));

    const assetsFolder = "assets";
    const assetsFolderPath = path.join("Scorm/files", assetsFolder);
    zipLesson.addLocalFolder(assetsFolderPath, assetsFolder);

    const jsFolder = "js";
    const jsFolderPaths = path.join("Scorm/files", jsFolder);
    zipLesson.addLocalFolder(jsFolderPaths, jsFolder);

    const scriptsFolder = "scripts";
    const scriptsFolderPaths = path.join("Scorm/files", scriptsFolder);
    zipLesson.addLocalFolder(scriptsFolderPaths, scriptsFolder);

    const contentIndex = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Lesson 1</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="description" content="" />
    <link rel="stylesheet" type="text/css" href="./assets/style.css" />
    <link rel="stylesheet" type="text/css" href="./assets/fonts.css" />
    <link rel="icon" href="./assets/fav.png">
</head>

<body>


    <div id="main-text-container">

        <div id="slideBg"> </div>

        <div id="textBackground"  style="z-index:100;"></div>

        <div style="position:absolute;z-index: 101;">

            <div id="kinetic-3">

                <div id = "textContainer" >

                    <div class="line1">
                        <div id="container30" #container30></div>
                    </div>
                    <div class="line2">
                        <div id="container31" #container31></div>
                    </div>
                    <div class="line3">
                        <div id="container32" #container32></div>
                    </div>

                </div>

            </div>
        </div>

        <img style="z-index: 102" id="logo" src="./assets/logo-edutecno-2.png" alt="Logo">
        <img id="play-buttom" src="./assets/play.png" alt="Play">
    </div>



    <script src="./scripts/gsap.min.js"></script>
    <script src="./scripts/SplitText.min.js"></script>
    <script src="./js/engine.js" type="module"></script>

</body>

</html>`;
    zipLesson.addFile("index.html", Buffer.from(contentIndex));
    errorLine = 219
    // faz o loop nos parágrafos e adiciona os arquivos nas pastas
    for (let i = 0; i < paragraphs.length; i++) {
      const audioFile = paragraphs[i].audioUrl;
      const imageFile = paragraphs[i].imageData.finalImage.url;
      errorLine = 226

      const videoFile = paragraphs[i].videoData.finalVideo.url;

      if (imageFile === "" && videoFile === "") {
        continue;
      }

      if (audioFile === "") {
        continue;
      }
      // Audio process
      const urlAudio = audioFile.substring(audioFile.indexOf("/speeches") + 1);
      const responseAudio = await fetch(audioFile);
      if (!responseAudio.ok) {
        throw new Error("Failed to fetch audio");
      }
      const fileContentAudio = await responseAudio.buffer();
      zipLesson.addFile(urlAudio, Buffer.from(fileContentAudio));

      // Images process
      if (imageFile !== "") {
        const urlImage = imageFile.substring(imageFile.indexOf("/images") + 1);
        const responseImage = await fetch(imageFile);
        if (!responseImage.ok) {
          throw new Error("Failed to fetch audio or image file.");
        }

        const fileContentImage = await responseImage.buffer();
        zipLesson.addFile(urlImage, Buffer.from(fileContentImage));
      }

      zipLesson.addFile(jsonFilePath, Buffer.from(jsonContent));
    }
    errorLine = 241
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
    errorLine = 263
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
    console.info("scorm criado ou atualizado com sucesso, inicio do processo de compressão");
    await createInstructionsDoc(scormData);
  }
  errorLine = 301
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
  errorLine = 317
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
      errorLine = 336
      let sectionIndex = 0;
      let lessonCounter = 0;
      let htmlFileCount = 1;
      let quizFileCount = 1;
      numberLessons = 0;
      numberRecourses = 0;

      errorLine = 344
      while (sectionIndex <= sectionCount - 1) {
        if (resp.sections[sectionIndex]) {
          const section = resp.sections[sectionIndex];
          const elementCount = section.elements.length;

          let elementIndex = 0;
          lessonCounter = 0;
          quizFileCount = 1;

          errorLine = 354
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

                errorLine = 374
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
      errorLine = 487

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

        errorLine = 514

        const zipBuffer = zipCourse.toBuffer();
        const zipBlobName = zipFileName;
        const blockBlobClient = containerClient.getBlockBlobClient(zipBlobName);
        await blockBlobClient.uploadData(zipBuffer);
        console.log(
          `Arquivo ZIP '${zipFileName}' salvo no container '${containerName}'`
        )
        sendScormDownloadEmail(req.query.recipientEmail, zipFileName)      
      }

      errorLine = 525

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

        errorLine = 563

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

      errorLine = 579

      deleteFolders(courseCode)
        .then(() => {
          console.log("Pastas excluídas com sucesso.");
        })
        .catch((error) => {
          console.error("Erro ao excluir as pastas:", error);
        });
      await updateScormStatus(courseCode);
    } catch (error) {
      // TODO: IMPLEMENT THIS 👇🏼
      sendFailedSCORMCreationEmail(req.query.recipientEmail)
      await saveLog(
        `Error creating scorm in line: ${errorLine}, body: ${JSON.stringify(req.body)}` + error.message,
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
