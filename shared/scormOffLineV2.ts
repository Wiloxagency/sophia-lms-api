import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "./mongo";
import archiver from "archiver";
import { tmpdir } from "os";
import { join } from "path";
import fetch from "node-fetch";
import { createWriteStream, promises as fs } from "fs";
import {
  sendFailedSCORMCreationEmail,
  sendSCORM2DownloadLinkEmail,
  sendScormUnderConstructionEmail,
} from "../nodemailer/sendMiscEmails";
import { downloadQuiz } from "../Quiz/download";
import { GlassTemplate } from "../themesTemplates/GlassTemplate";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "scormv2";
const scormBaseFilesPath = "scorm_base_files";

export async function createScormV2(
  course: any,
  selectedElements: any[],
  userEmail: string,
  userName: string
): Promise<string> {
  const courseCode = course.code;

  const database = createConnection();
  const db = await database;
  const colorTheme = await db
    .collection("courseTheme")
    .findOne({ code: course.slideshowColorThemeName });

  const containerClient = blobServiceClient.getContainerClient(containerName);

  console.log("START OF createScormV2");

  // Delete existing course directory if it exists
  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${courseCode}/`,
  })) {
    await containerClient.deleteBlob(blob.name);
  }

  // Process URLs, upload files, create slideshow.json, imsmanifest.xml, and zip each lesson folder
  for (const [sectionIndex, elementIndex] of selectedElements) {
    const section = course.sections?.[sectionIndex];
    const element = section?.elements?.[elementIndex];

    // Solo procesar si el elemento existe y es de tipo "Lección Engine"
    if (element && element.type === "Lección Engine") {
      const sectionFolder = `${courseCode}/Section${sectionIndex + 1}`;
      const lessonFolder = `${sectionFolder}/Section-${sectionIndex + 1}-Item-${
        elementIndex + 1
      }-Scorm`;
      const assetsFolder = `${lessonFolder}/assets`;

      await copyScormBaseFiles(containerClient, lessonFolder, assetsFolder);
      const assetFiles = [];

      const slides = [];

      for (const slide of element.elementLesson?.slides || []) {
        const templateArray = GlassTemplate.find(
          (t) => t[0].code === slide.slideTemplate
        );

        if (templateArray) {
          let slideTemplateCopy = JSON.parse(JSON.stringify(templateArray));

          const titleFont = course.titleFont || "OpenSans";
          const textFont = course.textFont || "OpenSans";

          slideTemplateCopy.slice(2).forEach((component: any) => {
            if ("title" in component) {
              component.titleFontFamily = titleFont;
            }
            if ("text" in component) {
              component.textFontFamily = textFont;
            }
          });

          const slideContent = slide.slideContent || {};
          const sections = slideContent.sections || [];

          const applyText = (value: string | undefined) => value ?? " ";

          slideTemplateCopy.forEach((component) => {
            if (typeof component === "object") {
              if (component.title === "[title]") {
                component.title = applyText(slideContent.title);
                component.titleFont = course.titleFont;
              }
              if (component.text === "[text]") {
                component.text = applyText(slideContent.text);
                component.textFont = course.textFont;
              }
              if (component.title === "[sections.0.subtitle]") {
                component.title = applyText(sections[0]?.subtitle);
                component.titleFont = course.titleFont;
              }
              if (component.text === "[sections.0.text]") {
                component.text = applyText(sections[0]?.text);
                component.textFont = course.textFont;
              }

              if (component.title === "[sections.1.subtitle]") {
                component.title = applyText(sections[1]?.subtitle);
                component.titleFont = course.titleFont;
              }
              if (component.text === "[sections.1.text]") {
                component.text = applyText(sections[1]?.text);
                component.textFont = course.textFont;
              }

              if (component.title === "[sections.2.subtitle]") {
                component.title = applyText(sections[2]?.subtitle);
                component.titleFont = course.titleFont;
              }
              if (component.text === "[sections.2.text]") {
                component.text = applyText(sections[2]?.text);
                component.textFont = course.textFont;
              }

              if (component.title === "[sections.3.subtitle]") {
                component.title = applyText(sections[3]?.subtitle);
                component.titleFont = course.titleFont;
              }
              if (component.text === "[sections.3.text]") {
                component.text = applyText(sections[3]?.text);
                component.textFont = course.textFont;
              }

              Object.keys(component).forEach((key) => {
                const value = component[key];
                if (typeof value === "string" && value.startsWith("[")) {
                  const colorKey = value.replace(/\[|\]/g, "");
                  if (colorTheme?.colors && colorTheme.colors[colorKey]) {
                    component[key] = colorTheme.colors[colorKey];
                  }
                }
              });
            }
          });

          const imageAssets = (slide.assets || []).filter(
            (a) => a.assetType === "photo"
          );
          const videoAssets = (slide.assets || []).filter(
            (a) => a.assetType === "video"
          );
          const iconAssets = (slide.assets || []).filter(
            (a) => a.assetType === "icon"
          );

          let imageAssetIndex = 0;
          let videoAssetIndex = 0;
          let iconAssetIndex = 0;

          const imageExtensionRegex =
            /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?|$)/i;
          const videoExtensionRegex = /\.(mp4|webm|ogg|mov|avi|wmv|mkv)(\?|$)/i;

          for (const component of slideTemplateCopy.slice(2)) {
            //templates con componentes mediaWithMirror o mediaWithVmirror
            if (
              component?.component === "mediaWithMirror" ||
              component?.component === "mediaWithVMirror"
            ) {
              if (videoAssetIndex < videoAssets.length) {
                const asset = videoAssets[videoAssetIndex++];
                if (
                  (asset.url.startsWith("http://") ||
                    asset.url.startsWith("https://")) &&
                  videoExtensionRegex.test(asset.url)
                ) {
                  try {
                    const uploadedVideoPath = await uploadFileFromUrl(
                      containerClient,
                      assetsFolder,
                      asset.url
                    );
                    component.video = `./assets/${uploadedVideoPath}`;
                    delete component.image;
                    assetFiles.push(`./assets/${uploadedVideoPath}`);
                  } catch (error) {
                    console.error(
                      `Error al procesar URL de video para mediaWithMirror: ${asset.url}:`,
                      error
                    );
                    videoAssetIndex--;
                  }
                } else if (videoExtensionRegex.test(asset.url)) {
                  component.video = normalizeAssetPath(asset.url);
                  delete component.image;
                }
              } else if (imageAssetIndex < imageAssets.length) {
                const asset = imageAssets[imageAssetIndex++];
                if (
                  (asset.url.startsWith("http://") ||
                    asset.url.startsWith("https://")) &&
                  imageExtensionRegex.test(asset.url)
                ) {
                  try {
                    const uploadedImagePath = await uploadFileFromUrl(
                      containerClient,
                      assetsFolder,
                      asset.url
                    );
                    component.image = `./assets/${uploadedImagePath}`;
                    delete component.video;
                    assetFiles.push(`./assets/${uploadedImagePath}`);
                  } catch (error) {
                    console.error(
                      `Error al procesar URL de imagen para mediaWithMirror: ${asset.url}:`,
                      error
                    );
                    imageAssetIndex--;
                  }
                } else if (imageExtensionRegex.test(asset.url)) {
                  component.image = normalizeAssetPath(asset.url);
                  delete component.video;
                }
              }
              continue;
            }

            if (
              component?.component === "img" &&
              imageAssetIndex < imageAssets.length
            ) {
              const asset = imageAssets[imageAssetIndex++];
              if (
                (asset.url.startsWith("http://") ||
                  asset.url.startsWith("https://")) &&
                imageExtensionRegex.test(asset.url)
              ) {
                try {
                  const uploadedImagePath = await uploadFileFromUrl(
                    containerClient,
                    assetsFolder,
                    asset.url
                  );
                  component.image = `./assets/${uploadedImagePath}`;
                  assetFiles.push(`./assets/${uploadedImagePath}`);
                } catch (error) {
                  console.error(
                    `Error al procesar URL de imagen ${asset.url}:`,
                    error
                  );
                }
              } else if (imageExtensionRegex.test(asset.url)) {
                component.image = normalizeAssetPath(asset.url);
              } else {
                console.log(
                  `URL de imagen ignorada (formato o extensión no válida): ${asset.url}`
                );
                imageAssetIndex--;
              }
            } else if (
              component?.component === "video" &&
              videoAssetIndex < videoAssets.length
            ) {
              const asset = videoAssets[videoAssetIndex++];
              if (
                (asset.url.startsWith("http://") ||
                  asset.url.startsWith("https://")) &&
                videoExtensionRegex.test(asset.url)
              ) {
                try {
                  const uploadedVideoPath = await uploadFileFromUrl(
                    containerClient,
                    assetsFolder,
                    asset.url
                  );
                  component.video = `./assets/${uploadedVideoPath}`;
                  assetFiles.push(`./assets/${uploadedVideoPath}`);
                } catch (error) {
                  console.error(
                    `Error al procesar URL de video ${asset.url}:`,
                    error
                  );
                }
              } else if (videoExtensionRegex.test(asset.url)) {
                component.video = normalizeAssetPath(asset.url);
              } else {
                console.log(
                  `URL de video ignorada (formato o extensión no válida): ${asset.url}`
                );
                videoAssetIndex--;
              }
            } else if (
              iconAssetIndex < iconAssets.length &&
              (component?.component === "iconRL" ||
                component?.component === "iconRT" ||
                (component?.component === "card" && "icon" in component))
            ) {
              const asset = iconAssets[iconAssetIndex++];

              if (
                (asset.url.startsWith("http://") ||
                  asset.url.startsWith("https://")) &&
                imageExtensionRegex.test(asset.url)
              ) {
                try {
                  const uploadedIconPath = await uploadFileFromUrl(
                    containerClient,
                    assetsFolder,
                    asset.url
                  );
                  component.icon = `./assets/${uploadedIconPath}`;
                  assetFiles.push(`./assets/${uploadedIconPath}`);
                } catch (error) {
                  console.error(
                    `Error al procesar URL de icono ${asset.url}:`,
                    error
                  );
                }
              } else if (imageExtensionRegex.test(asset.url)) {
                component.icon = normalizeAssetPath(asset.url);
              } else {
                console.log(
                  `URL de icono ignorada (formato o extensión no válida): ${asset.url}`
                );
                iconAssetIndex--;
              }
            }
          }

          console.log("THIS RUNS");

          if (slide.audioUrl) {
            try {
              const uploadedAudioPath = await uploadFileFromUrl(
                containerClient,
                assetsFolder,
                slide.audioUrl,
                false
              );

              let audioComponentFound = false;
              for (const component of slideTemplateCopy) {
                if (
                  component &&
                  typeof component === "object" &&
                  "audioUrl" in component
                ) {
                  component.audioUrl = `./assets/${uploadedAudioPath}`;
                  audioComponentFound = true;
                  break;
                }
              }

              if (!audioComponentFound) {
                console.warn(
                  `No se encontró un componente con la propiedad 'audioUrl' en la plantilla para la slide. El audio ${slide.audioUrl} no se asignará directamente a un componente.`
                );
              }

              assetFiles.push(`./assets/${uploadedAudioPath}`);
            } catch (error) {
              console.error(
                `Error al procesar URL de audio ${slide.audioUrl}:`,
                error
              );
            }
          }

          //templates con asset en fullscreen
          if (
            slide.isFullscreenAsset &&
            slide.assets &&
            slide.assets.length > 0
          ) {
            const meta = slideTemplateCopy.find(
              (c) => c.component === "meta-tag"
            );
            const audio = slideTemplateCopy.find(
              (c) => c.component === "audio"
            );

            const firstAsset = slide.assets[0];

            const mediaComponent = slideTemplateCopy.find(
              (c) =>
                (firstAsset?.assetType === "photo" && c.component === "img") ||
                (firstAsset?.assetType === "video" && c.component === "video")
            );

            if (mediaComponent) {
              mediaComponent.width = "100%";
              mediaComponent.height = "100%";
            }

            slideTemplateCopy = [meta, audio, mediaComponent].filter(Boolean);
          } else if (slide.isFullscreenAsset) {
            console.warn(
              "slide.isFullscreenAsset es true pero slide.assets está vacío o es undefined."
            );
          }

          slides.push(slideTemplateCopy);
        } else {
          console.warn(
            `Plantilla no encontrada para slide.slideTemplate: ${slide.slideTemplate}`
          );
        }
      }

      const urlCover = await uploadFileFromUrl(
        containerClient,
        assetsFolder,
        course.details.cover,
        true
      );
      assetFiles.push("./assets/" + urlCover);

      const urlMusicBg = course.slideshowBackgroundMusicUrl
        ? await uploadFileFromUrl(
            containerClient,
            assetsFolder,
            "https://app.iasophia.com" + course.slideshowBackgroundMusicUrl,
            true
          )
        : undefined;

      let slideshowContent: any[] = [
        { musicTrack: urlMusicBg ? `./assets/${urlMusicBg}` : "" },
        ...slides,
      ];

      if (urlMusicBg) {
        assetFiles.push("./assets/" + urlMusicBg);
      }

      const slideshowJsonPath = `${lessonFolder}/slideshow.json`;
      await uploadJsonFile(
        containerClient,
        slideshowJsonPath,
        slideshowContent
      );
      assetFiles.push(`./slideshow.json`);

      assetFiles.push(`./assets/index-8qi2pXCp.css`);
      assetFiles.push(`./assets/index-AAmY0ZWt.js`);

      const courseTitle = course.details.title;
      const courseId = courseTitle.split(" ").slice(0, 4).join("_");
      const imsmanifestContent = generateImsManifestXml(
        courseTitle,
        courseId,
        assetFiles
      );

      const imsmanifestPath = `${lessonFolder}/imsmanifest.xml`;
      await uploadXmlFile(containerClient, imsmanifestPath, imsmanifestContent);
      assetFiles.push(`./imsmanifest.xml`);

      await zipLessonFolder(containerClient, lessonFolder);
    } else if (element && element.type === "file") {
      const sectionFolder = `${courseCode}/Section${sectionIndex + 1}`;
      const fileName = `Section-${sectionIndex + 1}-Item-${elementIndex + 1}-${
        element.elementFile.name
      }`;
      const fileUrl = element.elementFile.url;

      const uploadedFileName = await uploadFileFromUrl(
        containerClient,
        sectionFolder,
        fileUrl,
        false,
        fileName
      );
      console.info(
        `Archivo subido correctamente: ${sectionFolder}/${uploadedFileName}`
      );
    } else if (
      element?.type === "shortAnswer" ||
      element?.type === "trueOrFalse" ||
      element?.type === "completion" ||
      element?.type === "quizz"
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

      const sectionFolder = `${courseCode}/Section${sectionIndex + 1}`;
      const fileName = `Section-${sectionIndex + 1}-Item-${
        elementIndex + 1
      }-Quiz-${element.type}.docx`;

      const QuizzFileName = `${sectionFolder}/${fileName}`;
      const blockBlobClient = containerClient.getBlockBlobClient(QuizzFileName);
      await blockBlobClient.upload(fileQuiz, fileQuiz.length);
      console.info(`Archivo de Quiz subido correctamente: ${QuizzFileName}`); // Añadido log
    }
  }

  // Delete all Section folders, keeping only the .zip files in each Section<m>
  console.log("RUNNING deleteSectionFolders()");
  await deleteSectionFolders(containerClient, courseCode);

  // Compress the entire course directory into a single .zip file
  console.log("RUNNING zipCourseDirectory()");
  await zipCourseDirectory(containerClient, courseCode);

  // Delete individual Section<m> zip files
  console.log("RUNNING deleteLessonZips()");
  await deleteLessonZips(containerClient, courseCode);

  const downloadLink =
    "https://sophiaassetsv2.blob.core.windows.net/scormol/" +
    course.code +
    ".zip";
  console.log("🚀 ~ downloadLink: ", downloadLink);

  return downloadLink;

  sendSCORM2DownloadLinkEmail(
    userEmail,
    userName,
    course.details.title,
    course.code + ".zip"
  );
}

// Function to delete Section folders after zipping
async function deleteSectionFolders(
  containerClient: ContainerClient,
  courseCode: string
) {
  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${courseCode}/`,
  })) {
    // Eliminar exclusivamente carpetas con el nuevo patrón Section-<m>-Item<n>-Scorm
    const scormFolderPattern =
      /Section\d+\/Section-\d+-Item-\d+-Scorm\/(?!.*\.zip$)/;
    if (scormFolderPattern.test(blob.name)) {
      await containerClient.deleteBlob(blob.name);
    }
  }
}

// Function to zip the entire course directory
async function zipCourseDirectory(
  containerClient: ContainerClient,
  courseCode: string
) {
  const zipFileName = `${courseCode}.zip`;
  const zipFilePath = join(tmpdir(), `${uuidv4()}.zip`);
  const output = createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);

  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${courseCode}/`,
  })) {
    const blobClient = containerClient.getBlobClient(blob.name);
    const blobData = await blobClient.download();
    archive.append(blobData.readableStreamBody, {
      name: blob.name.replace(`${courseCode}/`, ""),
    });
  }

  await archive.finalize();
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });

  // Upload the single .zip file to Azure Blob Storage
  const zipBlobClient = containerClient.getBlockBlobClient(zipFileName);
  await zipBlobClient.uploadFile(zipFilePath);

  // Clean up the temporary zip file
  await fs.unlink(zipFilePath);
}

// Function to delete all Scorm-S<m>-L<n>.zip files
async function deleteLessonZips(
  containerClient: ContainerClient,
  courseCode: string
) {
  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${courseCode}/`,
  })) {
    // Preservar el zip principal
    if (blob.name === `${courseCode}.zip`) {
      continue;
    }
    // Eliminar cualquier otro archivo o carpeta
    await containerClient.deleteBlob(blob.name);
  }
}

// Function to zip a lesson folder
async function zipLessonFolder(
  containerClient: ContainerClient,
  lessonFolder: string
) {
  const zipFileName = `${lessonFolder}.zip`;
  const zipFilePath = join(tmpdir(), `${uuidv4()}.zip`);
  const output = createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);
  for await (const blob of containerClient.listBlobsFlat({
    prefix: lessonFolder,
  })) {
    const blobClient = containerClient.getBlobClient(blob.name);
    const blobData = await blobClient.download();
    archive.append(blobData.readableStreamBody, {
      name: blob.name.replace(`${lessonFolder}/`, ""),
    });
  }

  await archive.finalize();
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });

  // Upload the .zip file to Azure Blob Storage
  const zipBlobClient = containerClient.getBlockBlobClient(zipFileName);
  await zipBlobClient.uploadFile(zipFilePath);

  // Clean up the temporary zip file
  await fs.unlink(zipFilePath);
}

// Function to copy files from scorm_base_files to each lesson folder
async function copyScormBaseFiles(
  containerClient: ContainerClient,
  lessonFolder: string,
  assetsFolder: string
) {
  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${scormBaseFilesPath}/`,
  })) {
    const blobName = blob.name.replace(`${scormBaseFilesPath}/`, ""); // Remove base folder prefix
    const targetBlobName = `${lessonFolder}/${blobName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(targetBlobName);
    await blockBlobClient.beginCopyFromURL(
      containerClient.getBlockBlobClient(blob.name).url
    );
  }
}

// Function to upload files from a URL, optionally generating a new UUID name for the file
async function uploadFileFromUrl(
  containerClient: ContainerClient,
  folder: string,
  fileUrl: string,
  generateNewName: boolean = true,
  optionalName?: string
): Promise<string> {
  const extension = fileUrl.split("?")[0].split(".").pop() || "";
  let fileName = generateNewName
    ? `${uuidv4()}.${extension}`
    : fileUrl.split("/").pop(); // Use original name if generateNewName is false
  fileName = optionalName ? optionalName : fileName;
  const blobName = `${folder}/${fileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const response = await fetch(fileUrl);
  if (!response.ok)
    throw new Error(`Failed to fetch file from URL: ${fileUrl}`);
  const buffer = await response.arrayBuffer();
  await blockBlobClient.uploadData(Buffer.from(buffer));
  return fileName; // Return just the file name for relative path usage
}

// Function to upload JSON content as a blob
async function uploadJsonFile(
  containerClient: ContainerClient,
  blobPath: string,
  content: object
) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
  const jsonData = JSON.stringify(content);
  await blockBlobClient.uploadData(Buffer.from(jsonData), {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
}

// Function to upload XML content as a blob
async function uploadXmlFile(
  containerClient: ContainerClient,
  blobPath: string,
  content: string
) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
  await blockBlobClient.uploadData(Buffer.from(content), {
    blobHTTPHeaders: { blobContentType: "application/xml" },
  });
}

// Function to generate imsmanifest.xml content
function generateImsManifestXml(
  courseTitle: string,
  courseId: string,
  assetFiles: string[]
): string {
  return `<?xml version="1.0" standalone="no" ?>
<manifest identifier="${courseId}" version="1"
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
    <organizations default="${courseId}">
        <organization identifier="${courseId}">
             <title>${courseTitle}</title>
             <item identifier="item_1" identifierref="resource_1">
                  <title>${courseTitle}</title>
             </item>
        </organization>
    </organizations>
    <resources>
        <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
            ${assetFiles.map((file) => `<file href="${file}" />`).join("\n")}
        </resource>
    </resources>
</manifest>`;
}

function normalizeAssetPath(url: string): string {
  if (url.startsWith("./assets")) {
    return url;
  }
  if (url.startsWith("/assets")) {
    return "." + url;
  }
}
