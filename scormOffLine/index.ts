import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "../shared/mongo";
import archiver from "archiver";
import { tmpdir } from "os";
import { join } from "path";
import { createWriteStream, promises as fs } from "fs";

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = "scormol";
const scormBaseFilesPath = "scorm_base_files"; // Base folder in the container

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const courseCode = req.query.code;
    if (!courseCode) {
        context.res = { status: 400, body: "Course code is required." };
        return;
    }

    const database = createConnection();
    const db = await database;
    const course = await db.collection("course").findOne({ code: courseCode });
    if (!course) {
        context.res = { status: 404, body: "Course not found." };
        return;
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Delete existing course directory if it exists
    for await (const blob of containerClient.listBlobsFlat({ prefix: `${courseCode}/` })) {
        await containerClient.deleteBlob(blob.name);
    }

    // Process URLs, upload files, create slideshow.json, imsmanifest.xml, and zip each lesson folder
    for (const [sectionIndex, section] of course.sections.entries()) {
        for (const [elementIndex, element] of section.elements.entries()) {
            const lessonFolder = `${courseCode}/Scorm-S${sectionIndex + 1}-L${elementIndex + 1}`;
            const assetsFolder = `${lessonFolder}/assets`;

            // Copy base files to each lesson folder
            await copyScormBaseFiles(containerClient, lessonFolder, assetsFolder);

            // Track all asset file paths for imsmanifest.xml
            const assetFiles = [];

            // Upload each photo, video, and audio in paragraphs to assets folder
            const paragraphs = [];
            for (const paragraph of element.elementLesson?.paragraphs || []) {
                const paragraphData = { ...paragraph };

                // Upload image
                if (paragraph.imageData?.finalImage?.url) {
                    const uploadedImagePath = await uploadFileFromUrl(containerClient, assetsFolder, paragraph.imageData.finalImage.url);
                    paragraphData.imageData.finalImage.url = `./assets/${uploadedImagePath}`;
                    assetFiles.push(`./assets/${uploadedImagePath}`);
                }

                // Upload video
                if (paragraph.videoData?.finalVideo?.url) {
                    const uploadedVideoPath = await uploadFileFromUrl(containerClient, assetsFolder, paragraph.videoData.finalVideo.url);
                    paragraphData.videoData.finalVideo.url = `./assets/${uploadedVideoPath}`;
                    assetFiles.push(`./assets/${uploadedVideoPath}`);
                }

                // Upload audio
                if (paragraph.audioUrl) {
                    const uploadedAudioPath = await uploadFileFromUrl(containerClient, assetsFolder, paragraph.audioUrl, false);
                    paragraphData.audioUrl = `./assets/${uploadedAudioPath}`;
                    assetFiles.push(`./assets/${uploadedAudioPath}`);
                }

                paragraphs.push(paragraphData);
            }

            // Generate slideshow.json content with updated relative URLs
            const slideshowContent = {
                courseCover: course.details.title,
                sectionTitle: section.title,
                type: "Lección Engine",
                title: "Presentation",
                elementCode: element.elementCode,
                elementLesson: {
                    lessonTheme: element.elementLesson?.lessonTheme || "",
                    paragraphs: paragraphs
                }
            };

            // Upload slideshow.json file to the appropriate lesson folder
            const slideshowJsonPath = `${lessonFolder}/slideshow.json`;
            await uploadJsonFile(containerClient, slideshowJsonPath, slideshowContent);
            assetFiles.push(`./slideshow.json`);

            // Generate imsmanifest.xml content
            const courseTitle = course.details.title;
            const courseId = courseTitle.split(" ").slice(0, 4).join("_");
            const imsmanifestContent = generateImsManifestXml(courseTitle, courseId, assetFiles);

            // Upload imsmanifest.xml file to the appropriate lesson folder
            const imsmanifestPath = `${lessonFolder}/imsmanifest.xml`;
            await uploadXmlFile(containerClient, imsmanifestPath, imsmanifestContent);
            assetFiles.push(`./imsmanifest.xml`);

            // Compress the lesson folder into a .zip file
            await zipLessonFolder(context, containerClient, lessonFolder);
        }
    }

    context.res = { status: 200, body: "Course assets, audio files, slideshow.json, imsmanifest.xml, and zip files created successfully." };
};

// Function to zip a lesson folder
async function zipLessonFolder(context: Context, containerClient: ContainerClient, lessonFolder: string) {
    const zipFileName = `${lessonFolder}.zip`;
    const zipFilePath = join(tmpdir(), `${uuidv4()}.zip`);
    const output = createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    for await (const blob of containerClient.listBlobsFlat({ prefix: lessonFolder })) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const blobData = await blobClient.download();
        archive.append(blobData.readableStreamBody, { name: blob.name.replace(`${lessonFolder}/`, "") });
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
async function copyScormBaseFiles(containerClient: ContainerClient, lessonFolder: string, assetsFolder: string) {
    for await (const blob of containerClient.listBlobsFlat({ prefix: `${scormBaseFilesPath}/` })) {
        const blobName = blob.name.replace(`${scormBaseFilesPath}/`, ""); // Remove base folder prefix
        const targetBlobName = `${lessonFolder}/${blobName}`;
        const blockBlobClient = containerClient.getBlockBlobClient(targetBlobName);
        await blockBlobClient.beginCopyFromURL(containerClient.getBlockBlobClient(blob.name).url);
    }
}

// Function to upload files from a URL, optionally generating a new UUID name for the file
async function uploadFileFromUrl(containerClient: ContainerClient, folder: string, fileUrl: string, generateNewName: boolean = true): Promise<string> {
    const extension = fileUrl.split(".").pop() || "";
    const fileName = generateNewName ? `${uuidv4()}.${extension}` : fileUrl.split("/").pop(); // Use original name if generateNewName is false
    const blobName = `${folder}/${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch file from URL: ${fileUrl}`);
    const buffer = await response.arrayBuffer();
    await blockBlobClient.uploadData(Buffer.from(buffer));
    return fileName; // Return just the file name for relative path usage
}

// Function to upload JSON content as a blob
async function uploadJsonFile(containerClient: ContainerClient, blobPath: string, content: object) {
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    const jsonData = JSON.stringify(content);
    await blockBlobClient.uploadData(Buffer.from(jsonData), {
        blobHTTPHeaders: { blobContentType: "application/json" }
    });
}

// Function to upload XML content as a blob
async function uploadXmlFile(containerClient: ContainerClient, blobPath: string, content: string) {
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    await blockBlobClient.uploadData(Buffer.from(content), {
        blobHTTPHeaders: { blobContentType: "application/xml" }
    });
}

// Function to generate imsmanifest.xml content
function generateImsManifestXml(courseTitle: string, courseId: string, assetFiles: string[]): string {
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
            ${assetFiles.map(file => `<file href="${file}" />`).join("\n")}
        </resource>
    </resources>
</manifest>`;
}

export default httpTrigger;
