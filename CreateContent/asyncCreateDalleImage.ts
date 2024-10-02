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
const openAIDalleLimit = 190

// Crear un cliente MongoDB
const database = createConnection()

const generateImage = async (currentItem: any, db: Db) => {

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
            prompt: currentItem.prompts[currentItem.prompts.length - 1],
            n: 1,
            size: randomNumber == 0 ? "1024x1024" : randomNumber == 1 ? "1792x1024" : "1024x1792",
            response_format: "b64_json",
        });
    } catch (error) {

        console.log("Dalle error:", error)

        // if rate_limit_exceeded

        if (error.code == 'content_policy_violation') {

            console.log("Dalle content_policy_violation:", currentItem.sectionIndex, currentItem.elementIndex, currentItem.slideIndex)
            const messagesArray: any = [
                {
                    role: "system",
                    content: "You are a prompt engineer",
                },
                {
                    role: "user",
                    content: `In the context of a course called: ${currentItem.courseName}, ` +
                        `what prompt in english for generating a High-resolution photo using DALL·E-3 would you recommend for a slide with the following text content:\n` +
                        `\n"${currentItem.paragraph}"\n` + 
                        `In case of including people, they are only Westerners.\n` + 
                        `Do not make any comments before or after the prompt.`,
                },

            ]
            currentItem.prompts.forEach((promptContent: string) => {

                messagesArray.push(
                    {
                        role: "system",
                        content: promptContent,
                    },
                    {
                        role: "user",
                        content: "This prompt violates the OpenAI Dall-E 3's usage policies, " +
                            "Rewrite a new prompt by avoiding the elements that could cause this violation.\n " +
                            "Focus more on the atmosphere and quality of the image; do not use words related to violence or known characters, " +
                            "or phrases that could be offensive, racist, or cruel. Also, avoid mentioning traumatic or sensitive events.\n " +
                            "Do not make any comments before or after the prompt.",
                    }
                )
            })
            messagesArray.push({
                role: "system",
                content: "The new prompt is:",
            })

            console.info("messagesArray:", messagesArray)

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messagesArray
            });

            updateCourseTokens(currentItem.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

            const generatedPrompt = response.choices[0].message.content
                .trim()
                .replace(/"/g, "")


            console.info("New prompt:", generatedPrompt);

            await db.collection("slide").updateOne(
                { _id: currentItem._id },
                {
                    $set: { dalleStatus: "waiting", messagesArray: messagesArray },
                    $push: { prompts: generatedPrompt }
                }
            );


        } else {
            await db.collection("slide").updateOne({ _id: currentItem._id }, { $set: { dalleStatus: "waiting" } });
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

        console.info("Image saved:", blockBlobClient.url)

        let currentParagraphArrayPath =
            `sections.${currentItem.sectionIndex}.elements.${currentItem.elementIndex}.elementLesson.paragraphs.${currentItem.slideIndex}.imageData.finalImage`;
        
        //TODO -> Due "srt" is a requiered key and iamge in not, temporarly usi srt as image created flag
        let currentSrtPath =
            `sections.${currentItem.sectionIndex}.elements.${currentItem.elementIndex}.elementLesson.paragraphs.${currentItem.slideIndex}.srt`;
        
            await db.collection("course").findOneAndUpdate(
            { code: currentItem.courseCode },
            {
                $set: {
                    [currentParagraphArrayPath]:
                    {
                        url: blockBlobClient.url,
                        width: randomSize.width,
                        height: randomSize.height
                    },
                    [currentSrtPath]: []
                },
            }
        );
        await db.collection("slide").updateOne(
            { _id: currentItem._id },
            {
                $set: {
                    dalleStatus: "created"
                }
            });

    } catch (error) {
        await db.collection("slide").updateOne({ _id: currentItem._id }, { $set: { dalleStatus: "waiting" } });
        console.log("Blob error:", error)
        return
    }
};

export async function AsyncDalleImgCycle() {

    console.info('AsyncDalleImgCycle function ran at:' + new Date().toISOString());

    const db = await database
    const slide = db.collection("slide")

    const imagesInList = await slide
        .find({ "dalleStatus": "waiting" })
        .sort({ "timestamp": 1 })
        .limit(openAIDalleLimit)
        .toArray();

    if (imagesInList.length <= 0)
        return

    const idsToUpdate = imagesInList.map(slide => slide._id);

    await slide.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { dalleStatus: "processing" } }
    );

    imagesInList.forEach(element => {
        generateImage(element, db)
    })


}