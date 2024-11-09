import { Db } from "mongodb";
import axios from "axios";

const Authorization = process.env.VECTEEZY_AUTH

export async function findVecteezyAssets(courseName: string, courseCode: string, courseStructure: string[], db: Db) {
    const collection = db.collection("vecteezy");

    console.info(courseStructure);
    console.info(courseStructure.length)

    for (let sectionIndex = 0; sectionIndex < courseStructure.length; sectionIndex++) {
        const query = `${courseName} ${courseStructure[sectionIndex]}`;
        
        console.info(`sectionIndex: ${sectionIndex}`);
        console.info(`query: ${query}`)

        // Configuración del encabezado de autorización
        const headers = {
            Authorization: Authorization
        };

        // Primer request: videos
        const videoResponse = await axios.get("https://api.vecteezy.com/v1/resources", {
            headers,
            params: {
                term: query,
                content_type: "video",
                page: 1,
                per_page: 30,
                sort_by: "relevance",
                ai_generated: false,
            }
        });

        await saveAssetsToDB(videoResponse.data.resources, sectionIndex, courseName, courseCode, "video", collection);

        // Segundo request: fotos
        const photoResponse = await axios.get("https://api.vecteezy.com/v1/resources", {
            headers,
            params: {
                term: query,
                content_type: "photo",
                page: 1,
                per_page: 30,
                sort_by: "relevance",
                ai_generated: false,
            }
        });

        await saveAssetsToDB(photoResponse.data.resources, sectionIndex, courseName, courseCode, "photo", collection);
    }
}

async function saveAssetsToDB(assets: any[], sectionIndex: number, courseName: string, courseCode: string, assetType: string, collection: any) {
    const documents = assets.map(asset => ({
        thumbnail_dimensions: asset.thumbnail_dimensions,
        preview_url: asset.preview_url,
        sectionIndex,
        courseName,
        courseCode,
        assetType,
    }));

    console.info(`${documents.length }${assetType}s saved.`)
    await collection.insertMany(documents);
}
