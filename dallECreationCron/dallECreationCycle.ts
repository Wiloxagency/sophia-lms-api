import { createConnection } from "../shared/mongo"
import { v4 as uuidv4 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";
import OpenAI from "openai";
import sharp = require("sharp");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "dalle";

// TODO -> Definir como variable de entorno
const openAILimit = 190

// Crear un cliente MongoDB
const database = createConnection()

const generateImage = async (currentItem, dallePrompt) => {

    await dallePrompt.updateOne({ _id: currentItem._id }, { $set: { status: "processing" } });


    let imageResponse: OpenAI.Images.ImagesResponse

    try {
        imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: currentItem.prompt,
            n: 1,
            size: "1792x1024",
            response_format: "b64_json",
        });
    } catch (error) {
        await dallePrompt.updateOne({ _id: currentItem._id }, { $set: { status: "started" } });
        console.log("Dalle error:", error)
        return
    }

    try {
        const input = Buffer.from(imageResponse.data[0].b64_json, "base64");

        const output = await sharp(input).jpeg().toBuffer();

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            AZURE_STORAGE_CONNECTION_STRING
        );

        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        const blobName = uuidv4() + ".jpeg";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(output, output.length);
        await dallePrompt.updateOne(
            { _id: currentItem._id }, 
            { $set: { 
                url: blockBlobClient.url,
                status: "completed" 
            } });
        console.info("saved:", blockBlobClient.url)
        

    } catch (error) {
        await dallePrompt.updateOne({ _id: currentItem._id }, { $set: { status: "started" } });
        console.log("Blob error:", error)
        return
    }
};

export async function aiImageCreation() {

    console.info('aiImageCreation function ran at:' + new Date().toISOString());

    const db = await database
    const dallePrompt = db.collection("dallePrompt")

    const imagesInList = await dallePrompt
        .find({ "status": "started" })
        .sort({ "timestamp": 1 })
        .limit(openAILimit)
        .toArray();

    if (imagesInList.length <= 0)
        return

    imagesInList.forEach(element => {
        generateImage(element, dallePrompt)
    })


}