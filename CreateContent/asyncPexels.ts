import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

export async function AsyncPexelsCycle() {
    console.info('AsyncPexelsCycle function ran at:' + new Date().toISOString());

    const db = await database;
    const slideCollection = db.collection("slide");
    const pexelsCollection = db.collection("pexels");
    const courseCollection = db.collection("course");
    const usedAssetsCollection = db.collection("used_assets"); // Nueva colección para registrar los assets usados

    // Obtener todos los documentos de slide con pexelsStatus igual a "waiting"
    const slides = await slideCollection.find({ pexelsStatus: "waiting" }).toArray();

    for (const slideDoc of slides) {
        const { courseCode, sectionIndex, elementIndex, slideIndex } = slideDoc;

        try {
            // Determinar el tipo de asset: video para slideIndex par, foto para impar
            const isEvenSlideIndex = slideIndex % 2 === 0;
            let assetType = isEvenSlideIndex ? "video" : "photo";

            // Intentar buscar un documento en pexels con el tipo de asset seleccionado que no haya sido usado
            let pexelsDoc = await pexelsCollection.findOne({
                courseCode,
                sectionIndex,
                assetType,
                asset_id: { $nin: await usedAssetsCollection.distinct("asset_id") }
            });

            // Si no se encuentra un asset, intentar sin `sectionIndex`
            if (!pexelsDoc) {
                pexelsDoc = await pexelsCollection.findOne({
                    courseCode,
                    assetType,
                    asset_id: { $nin: await usedAssetsCollection.distinct("asset_id") }
                });
            }

            // Si aún no se encuentra un asset, utilizar la foto por defecto
            const finalData = pexelsDoc
                ? {
                    url: pexelsDoc.preview_url,
                    width: pexelsDoc.preview_dimensions.width,
                    height: pexelsDoc.preview_dimensions.height
                }
                : {
                    url: "./assets/slide-placeholder.png",
                    width: 1024,
                    height: 576 // Dimensiones estándar de imagen de placeholder
                };
            assetType = pexelsDoc ? assetType : "image"
            
            // Determinar el campo de actualización en `course` según el tipo de asset
            const updateField = assetType === "video"
                ? `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo`
                : `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.imageData.finalImage`;

            const currentSrtPath =
                `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${slideIndex}.srt`;

            // Actualizar el documento course con la información obtenida
            await courseCollection.updateOne(
                { code: courseCode },
                {
                    $set: {
                        [updateField]: finalData,
                        [currentSrtPath]: []
                    }
                }
            );

            // Si se encontró un documento en pexels, registrar su `asset_id` en `used_assets` en lugar de eliminarlo directamente
            if (pexelsDoc) {
                await usedAssetsCollection.insertOne({ asset_id: pexelsDoc.asset_id });
            }

            // Actualizar el estado de `assetStatus` en el documento de `slide` a "created"
            await slideCollection.updateOne(
                { _id: slideDoc._id },
                { $set: { pexelsStatus: "created" } }
            );

        } catch (error) {
            await saveLog(
                `Error: ${error.message} getting Pexels assets from DB in course: ${courseCode}, sectionIndex ${sectionIndex}, slideIndex ${slideIndex}`,
                "Error",
                "AsyncPexelsCycle()",
                "Courses/{courseCode}/CreateContent"
            );
        }
    }

    // Al final, eliminar los documentos de `pexels` que han sido registrados en `used_assets`
    const usedAssetIds = await usedAssetsCollection.distinct("asset_id");
    await pexelsCollection.deleteMany({ asset_id: { $in: usedAssetIds } });
}
