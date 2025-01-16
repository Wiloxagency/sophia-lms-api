import { Db } from "mongodb";
import { createClient } from "pexels";
import { translateQuery } from "../shared/translator";

const pexelsClient = createClient(
    "mtCEdnRigTAFPj5nELvf5XSfjwfslcwz1qGfCf0gj1EZ57XCh3KraNns"
);

// Helper function to determine orientation based on dimensions
function getOrientation(width: number, height: number): string {
    if (width === height) return "square";
    return width > height ? "landscape" : "portrait";
}

export async function findPexelsAssets(courseName: string, courseCode: string, courseStructure: string[], db: Db) {

    const collection = db.collection("pexels");

    console.info(courseStructure);
    console.info(courseStructure.length)

    // Primer request: videos verticales por nombre de curso
        
    let query: string = await translateQuery(courseName);

    const videoResponse: any = await pexelsClient.videos.search({
        query,
        orientation: "portrait",
        per_page: 80,
    });
    await saveVideosToDB(videoResponse.videos, -1, courseName, courseCode, "video", collection);

    // Segundo request: fotos cuadradas por nombre de curso
    let responseImages: any = await pexelsClient.photos.search({
        query,
        orientation: "square",
        per_page: 80,
      });

    await saveImagesToDB(responseImages.photos, -1, courseName, courseCode, "photo", collection);

    for (let sectionIndex = 0; sectionIndex < courseStructure.length; sectionIndex++) {
        const originalQuery = `${courseName} ${courseStructure[sectionIndex]}`;

        console.info(`sectionIndex: ${sectionIndex}`);
        console.info(`originalQuery: ${originalQuery}`)

        let query: string = await translateQuery(originalQuery);

        console.info(query)

        // Tercer request: videos en cualquier orientación por sección
        
        const videoResponse: any = await pexelsClient.videos.search({
            query,
            per_page: 80,
        });

        await saveVideosToDB(videoResponse.videos, sectionIndex, courseName, courseCode, "video", collection);

        // Cuarto request: fotos en cualquier orientación por sección
        let responseImages: any = await pexelsClient.photos.search({
            query,
            per_page: 80,
    
          });

        await saveImagesToDB(responseImages.photos, sectionIndex, courseName, courseCode, "photo", collection);
    }
}

async function saveVideosToDB(
    videos: any[],
    sectionIndex: number,
    courseName: string,
    courseCode: string,
    assetType: string,
    collection: any) {

    const firstHDVideos = videos.map(video =>
        video.video_files.find(file => file.quality === 'hd')
    ).filter(Boolean);

    const documents =

        firstHDVideos.map(video => ({
            asset_id: video.id,
            preview_dimensions: {width: video.width, height: video.height},
            preview_url: video.link,
            orientation: getOrientation(video.width, video.height),
            sectionIndex,
            courseName,
            courseCode,
            assetType,
        }));

    console.info(`${documents.length} ${assetType}s saved.`)
    await collection.insertMany(documents);
}

async function saveImagesToDB(
    photos: any[],
    sectionIndex: number,
    courseName: string,
    courseCode: string,
    assetType: string,
    collection: any) {

    const documents =
    photos.map(photo => ({
            asset_id: photo.id,
            preview_dimensions: {width: photo.width, height: photo.height},
            preview_url: photo.src.original,
            orientation: getOrientation(photo.width, photo.height),
            sectionIndex,
            courseName,
            courseCode,
            assetType,
        })).filter(Boolean);;

    console.info(`${documents.length} ${assetType}s saved.`)
    await collection.insertMany(documents);
}
