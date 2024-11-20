import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

export async function AsyncVecteezyCycle() {
    console.info('AsyncVecteezyCycle function ran at:' + new Date().toISOString());

    const db = await database;
    const slideCollection = db.collection("slide");
    const vecteezyCollection = db.collection("vecteezy");
    const courseCollection = db.collection("course");
    const usedAssetsCollection = db.collection("used_assets"); // Nueva colección para registrar los assets usados

    // Obtener todos los documentos de slide con assetStatus igual a "waiting"
    const slides = await slideCollection.find({ assetStatus: "waiting" }).toArray();

    for (const slideDoc of slides) {
        const { courseCode, sectionIndex, elementIndex, slideIndex } = slideDoc;

        try {
            // Determinar el tipo de asset: video para slideIndex par, foto para impar
            const isEvenSlideIndex = slideIndex % 2 === 0;
            let assetType = isEvenSlideIndex ? "video" : "photo";

            // Intentar buscar un documento en vecteezy con el tipo de asset seleccionado que no haya sido usado
            let vecteezyDoc = await vecteezyCollection.findOne({
                courseCode,
                sectionIndex,
                assetType,
                asset_id: { $nin: await usedAssetsCollection.distinct("asset_id") }
            });

            // Si no se encuentra un asset, intentar sin `sectionIndex`
            if (!vecteezyDoc) {
                vecteezyDoc = await vecteezyCollection.findOne({
                    courseCode,
                    assetType,
                    asset_id: { $nin: await usedAssetsCollection.distinct("asset_id") }
                });
            }

            // Si aún no se encuentra un asset, utilizar la foto por defecto
            const finalData = vecteezyDoc
                ? {
                    url: vecteezyDoc.preview_url,
                    width: vecteezyDoc.preview_dimensions.width,
                    height: vecteezyDoc.preview_dimensions.height
                }
                : {
                    url: "./slide-placeholder.png",
                    width: 1024,
                    height: 576 // Dimensiones estándar de imagen de placeholder
                };
            assetType = vecteezyDoc ? assetType : "image"
            
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

            // Si se encontró un documento en vecteezy, registrar su `asset_id` en `used_assets` en lugar de eliminarlo directamente
            if (vecteezyDoc) {
                await usedAssetsCollection.insertOne({ asset_id: vecteezyDoc.asset_id });
            }

            // Actualizar el estado de `assetStatus` en el documento de `slide` a "created"
            await slideCollection.updateOne(
                { _id: slideDoc._id },
                { $set: { assetStatus: "created" } }
            );

        } catch (error) {
            await saveLog(
                `Error: ${error.message} getting Vecteezy assets from DB in course: ${courseCode}, sectionIndex ${sectionIndex}, slideIndex ${slideIndex}`,
                "Error",
                "AsyncVecteezyCycle()",
                "Courses/{courseCode}/CreateContent"
            );
        }
    }

    // Al final, eliminar los documentos de `vecteezy` que han sido registrados en `used_assets`
    const usedAssetIds = await usedAssetsCollection.distinct("asset_id");
    await vecteezyCollection.deleteMany({ asset_id: { $in: usedAssetIds } });
}
