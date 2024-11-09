import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

export async function AsyncVecteezyCycle() {
    console.info('AsyncVecteezyCycle function ran at:' + new Date().toISOString());


    const db = await database;
    const slideCollection = db.collection("slide");
    const vecteezyCollection = db.collection("vecteezy");
    const courseCollection = db.collection("course");

    // Obtener todos los documentos de slide con assetStatus igual a "waiting"
    const slides = await slideCollection.find({ assetStatus: "waiting" }).toArray();

    for (const slideDoc of slides) {
        const { courseCode, sectionIndex, slideIndex } = slideDoc;

        try {
            // Determinar el tipo de asset: video para slideIndex par, foto para impar
            const isEvenSlideIndex = slideIndex % 2 === 0;
            let assetType = isEvenSlideIndex ? "video" : "photo";

            // Intentar buscar un documento en vecteezy con el tipo de asset seleccionado
            let vecteezyDoc = await vecteezyCollection.findOne({
                courseCode,
                sectionIndex,
                assetType
            });

            // Si no se encuentra un video y se requiere video, intentar buscar una foto
            if (!vecteezyDoc && assetType === "video") {
                assetType = "photo"; // Cambiar a foto si no hay video disponible
                vecteezyDoc = await vecteezyCollection.findOne({
                    courseCode,
                    sectionIndex,
                    assetType
                });
            }

            // Si se encontró un documento de vecteezy, proceder con la actualización
            if (vecteezyDoc) {
                const { preview_url, thumbnail_dimensions } = vecteezyDoc;

                // Crear el objeto con los datos de la imagen o video
                const finalData = {
                    url: preview_url,
                    width: thumbnail_dimensions.width,
                    height: thumbnail_dimensions.height
                };

                console.info(`Saving ${assetType}`)

                // Determinar el campo de actualización en `course` según el tipo de asset
                const updateField = assetType === "video"
                    ? `sections.${sectionIndex}.elements.0.elementLesson.paragraphs.${slideIndex}.videoData.finalVideo`
                    : `sections.${sectionIndex}.elements.0.elementLesson.paragraphs.${slideIndex}.imageData.finalImage`;

                //TODO -> Due "srt" is a requiered key and iamge in not, temporarly usi srt as image created flag
                const currentSrtPath =
                    `sections.${sectionIndex}.elements.0.elementLesson.paragraphs.${slideIndex}.srt`;

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

                // Eliminar el documento en `vecteezy` para evitar su reutilización
                await vecteezyCollection.deleteOne({ _id: vecteezyDoc._id });

                // Actualizar el estado de `assetStatus` en el documento de `slide` a "created"
                await slideCollection.updateOne(
                    { _id: slideDoc._id },
                    { $set: { assetStatus: "created" } }
                );
            } else {
                await saveLog(
                    `Warning: Did not found asstets in vecteezy records for course: ${courseCode}, sectionIndex ${sectionIndex}, slideIndex ${slideIndex}`,
                    "Warning",
                    "AsyncVecteezyCycle()",
                    "Courses/{courseCode}/CreateContent"
                );
            }

        } catch (error) {
            await saveLog(
                `Error: ${error.message} getting Vecteezy asstes from DB in course: ${courseCode}, sectionIndex ${sectionIndex}, slideIndex ${slideIndex}`,
                "Error",
                "AsyncVecteezyCycle()",
                "Courses/{courseCode}/CreateContent"
            );
        }

    }


}