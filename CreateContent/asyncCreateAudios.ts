
import azure = require("azure-storage")
import { BlobServiceClient } from "@azure/storage-blob";
import { createConnection } from "../shared/mongo";
import { Db } from "mongodb";
import OpenAI from "openai";
import rp = require('request-promise')
import { saveLog } from "../shared/saveLog";
import { v4 as uuidv4 } from "uuid"; // Import the UUID generator
import xmlbuilder = require("xmlbuilder")

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
const TTS_SUBSCRIPTION_KEY = process.env.TTS_SUBSCRIPTION_KEY

// Set up Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING 
);
const containerName = "speeches";

const azureTTSLimit = 600

const database = createConnection()

async function reverseStatus (slideItem: any) {
    const db = await database
    await db.collection("slide").
            updateOne({ _id: slideItem._id }, { $set: { ttsStatus: "waiting" } });
}

function textToSpeech(accessToken: string,  writableStream: any, slideItem: any) {

    // const languageCode = isoLanguage[language]
    const languageCode = slideItem.language

    return new Promise((resolve, reject) => {
        try {
            let xml_body = xmlbuilder
                .create("speak")
                .att("version", "1.0")
                .att("xml:lang", "en-us")
                .ele("voice")
                .att("xml:lang", "en-us")
                .att('name', 'Microsoft Server Speech Text to Speech Voice (' + languageCode + ', ' + slideItem.voice + ')')
                .txt(slideItem.paragraph)
                .end()

            let body = xml_body.toString()
            //console.info("xml_body.toString-->", body)

            let options = {
                method: "POST",
                baseUrl: 'https://eastus2.tts.speech.microsoft.com/',
                url: "cognitiveservices/v1",
                headers: {
                    Authorization: "Bearer " + accessToken,
                    "cache-control": "no-cache",
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
                    'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
                    "Content-Type": "application/ssml+xml",
                },
                body: body,
            }

            rp(options)
                .pipe(writableStream)
                .on("finish", () => {
                    resolve("done")
                });
        } catch (error) {
            reverseStatus (slideItem)
            saveLog(`Error creating text to speech for course: ${slideItem.courseCode}, ` + error.message, "Error", "textToSpeech()", "Courses/{courseCode}/CreateContent")
            reject(error)
        }
    });
}


export async function getAccessToken(subscriptionKey: string, slideItem: any, db: Db) {
    try {
        let options = {
            method: 'POST',
            uri: 'https://eastus2.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        }
        return rp(options);
    } catch (error) {
        reverseStatus (slideItem)
        await saveLog(`Error getting a token for course: ${slideItem.courseCode}` + error.message, "Error", "getAccessToken()", "Courses/{courseCode}/CreateContent")
    }

}

const generateTTS = async (slideItem: any, db: Db) => {

    const blobName = `${uuidv4()}.mp3`;

    try {
        const accessToken = await getAccessToken(TTS_SUBSCRIPTION_KEY, slideItem, db)
        const blobService = azure.createBlobService(AZURE_STORAGE_CONNECTION_STRING)
        const writableStream = blobService.createWriteStreamToBlockBlob(
            "speeches",
            blobName,
            {
                blockIdPrefix: "block",
                contentSettings: {
                    contentType: "audio/mpeg",
                },
            },
        )
        // await textToSpeech(accessToken, slideItem.paragraph, writableStream, slideItem.voice, slideItem.language, slideItem.courseCode)

        await textToSpeech(accessToken, writableStream, slideItem)
        const audioUrl = blobService.getUrl("speeches") + "/" + blobName

        console.info("Audio saved:", audioUrl)

        let currentAudioPath =
            `sections.${slideItem.sectionIndex}.elements.${slideItem.elementIndex}.elementLesson.slides.${slideItem.slideIndex}.audioUrl`;
        await db.collection("course").findOneAndUpdate(
            { code: slideItem.courseCode },
            {
                $set: {
                    [currentAudioPath]: audioUrl
                },
            }
        );

        await db.collection("slide").
            updateOne({ _id: slideItem._id }, { $set: { ttsStatus: "created" } });

    } catch (err) {
        reverseStatus (slideItem)
        await saveLog(`Error creating audio for course: ${slideItem.courseCode}, sectionIndex ${slideItem.sectionIndex}, elementIndex ${slideItem.elementIndex}, slideIndex ${slideItem.slideIndex}.`, "Error", "asyncCreateAudios()", "Courses/{courseCode}/CreateContent")
    }

}

export async function AsyncTextToSpeechCycle() {

    console.info('asyncTextToSpeech function ran at:' + new Date().toISOString());

    const db = await database
    const slide = db.collection("slide")

    const slidesInList = await slide
        .find({ "ttsStatus": "waiting" })
        .sort({ "timestamp": 1 })
        .limit(azureTTSLimit)
        .toArray();

    if (slidesInList.length <= 0)
        return

    const idsToUpdate = slidesInList.map(slide => slide._id);

    await slide.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { ttsStatus: "processing" } }
    );

    let index = 0;
    const interval = 1000 / 10; // 10 TPS (Azure TTS Limit)

    function processNextSlide() {
        if (index >= slidesInList.length) return;

        const slideItem = slidesInList[index];
        if (slideItem.paragraph && slideItem.paragraph.length > 0) {
            generateTTS(slideItem, db);
        }

        index++;
        if (index < slidesInList.length) {
            setTimeout(processNextSlide, interval);
        }
    }

    processNextSlide();

}


