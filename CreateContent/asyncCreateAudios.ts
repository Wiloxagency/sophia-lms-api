
import OpenAI from "openai";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid"; // Import the UUID generator
import { createConnection } from "../shared/mongo";
import { Db } from "mongodb";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Set up Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING // Make sure this is set in your environment
);
const containerName = "speeches"; // Replace with your container name

const openAILimit = 1000

const database = createConnection()

const generateTTS = async (slideItem: any, db: Db) => {

    await db.collection("slide").
        updateOne({ _id: slideItem._id }, { $set: { status: "processing" } });

    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: slideItem.paragraph,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());

        const blobName = `${uuidv4()}.mp3`;
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: "audio/mpeg" },
        });

        console.info("Ausio saved:", blockBlobClient.url)

        let currentAudioPath =
            `sections.${slideItem.sectionIndex}.elements.${slideItem.elementIndex}.elementLesson.paragraphs.${slideItem.slideIndex}.audioUrl`;
        await db.collection("course").findOneAndUpdate(
            { code: slideItem.courseCode },
            {
                $set: {
                    [currentAudioPath]: blockBlobClient.url
                },
            }
        );

        await db.collection("slide").
            updateOne({ _id: slideItem._id }, { $set: { ttsStatus: "completed" } });


    } catch (error) {
        console.log("TTS error:", error)
        await db.collection("slide").
            updateOne({ _id: slideItem._id }, { $set: { ttsStatus: "waiting" } });

    }

}

export async function asyncTextToSpeech() {

    console.info('asyncTextToSpeech function ran at:' + new Date().toISOString());

    const db = await database
    const slide = db.collection("slide")

    const slideList = await slide
        .find({ "ttsStatus": "waiting" })
        .sort({ "timestamp": 1 })
        .limit(openAILimit)
        .toArray();

    if (slideList.length <= 0)
        return

    slideList.forEach(slideItem => {
        if (slideItem.paragraph && slideItem.paragraph.length > 0) {
            generateTTS(slideItem, db)
        }
        
    })

}


