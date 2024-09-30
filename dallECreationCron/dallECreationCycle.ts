import { createConnection } from "../shared/mongo"
import { v4 as uuidv4 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";
import OpenAI from "openai";
import sharp = require("sharp");
import { Db } from "mongodb";
import { updateCourseTokens } from "../Course/courseTokenCounter";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "dalle";

// TODO -> Definir como variable de entorno
const openAILimit = 190

// Crear un cliente MongoDB
const database = createConnection()

const generateImage = async (currentItem, db: Db) => {

    await db.collection("dallePrompt").updateOne({ _id: currentItem._id }, { $set: { status: "processing" } });


    let imageResponse: OpenAI.Images.ImagesResponse

    // Define possible image sizes
    const imageSizes = [
        { width: 1024, height: 1024 },
        { width: 1792, height: 1024 },
        { width: 1024, height: 1792 }
    ];



    // Randomly select an image size
    const randomNumber = Math.floor(Math.random() * imageSizes.length)
    const randomSize = imageSizes[randomNumber];
  
    try {
        imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: currentItem.prompt,
            n: 1,
            size: randomNumber==0?"1024x1024":randomNumber==1?"1792x1024":"1024x1792",
            response_format: "b64_json",
        });
    } catch (error) {
        
        console.log("Dalle error:", error)

        if (error.code == 'content_policy_violation') {

            const newPrompt = `The following prompt violates one of OpenAI Dall-E 3's usage policies: 
            "${currentItem.prompt}"
            Rewrite a new prompt by removing the elements that could cause this violation. 
            Focus more on the atmosphere and quality of the image; do not use words related to violence or known characters, 
            or phrases that could be offensive, racist, or cruel. Also, avoid mentioning traumatic or sensitive events.
            Do not make any comments before or after the prompt; simply create a new prompt based on the previous one. `
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: "You are a prompt engineer",
                  },
                  {
                    role: "user",
                    content: newPrompt,
                  },
                  {
                    role: "system",
                    content: "The new prompt is:",
                  },
                ],
              });
          
              updateCourseTokens(currentItem.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);
          
              const generatedPrompt = response.choices[0].message.content
                .trim()
                .replace(/"/g, "")
          
          
              console.info("New prompt:", generatedPrompt);
              await db.collection("dallePrompt").updateOne({ _id: currentItem._id }, { $set: { status: "started", prompt: generatedPrompt } });
              generateImage(currentItem, db)

        } else {
            await db.collection("dallePrompt").updateOne({ _id: currentItem._id }, { $set: { status: "started" } });
        }
        
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
        
        console.info("saved:", blockBlobClient.url)

        

        let currentParagraphArrayPath = 
            `sections.${currentItem.sectionIndex}.elements.${currentItem.elementIndex}.elementLesson.paragraphs.${currentItem.slideIndex}.imageData.finalImage`;
        await  db.collection("course").findOneAndUpdate(
            { code: currentItem.courseCode },
            {
              $set: {
                [currentParagraphArrayPath]:
                {
                    url: blockBlobClient.url,
                    width: randomSize.width,
                    height: randomSize.height
                }
              },
            }
          );
          await db.collection("dallePrompt").updateOne(
            { _id: currentItem._id }, 
            { $set: { 
                url: blockBlobClient.url,
                status: "completed" 
            } });

    } catch (error) {
        await  db.collection("dallePrompt").updateOne({ _id: currentItem._id }, { $set: { status: "started" } });
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
        generateImage(element, db)
    })


}