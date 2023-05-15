import azure = require("azure-storage")
import { isoLanguage } from "./gpt3.prompt"
import rp = require('request-promise')
import { v4 as uuidv4 } from 'uuid'
import xmlbuilder = require("xmlbuilder")
import { saveLog } from "../shared/saveLog"

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
const TTS_SUBSCRIPTION_KEY = process.env.TTS_SUBSCRIPTION_KEY

async function getAccessToken(subscriptionKey: string, courseCode: string) {
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
        await saveLog(`Error getting a token for course: ${courseCode}` + error.message, "Error", "getAccessToken()", "Courses/{courseCode}/CreateContent")
    }

}

function textToSpeech(accessToken: string, text: string, writableStream: any, voice: string, language: string, courseCode: string) {

    const languageCode = isoLanguage[language]

     return new Promise((resolve, reject)  => {
        try {
            let xml_body = xmlbuilder
                .create("speak")
                .att("version", "1.0")
                .att("xml:lang", language.toLocaleLowerCase())
                .ele("voice")
                .att("xml:lang", language.toLocaleLowerCase())
                .att('name', 'Microsoft Server Speech Text to Speech Voice (' + language + ', ' + voice + ')')
                .txt(text)
                .end()

            let body = xml_body.toString()

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
            saveLog(`Error creating text to speech for course: ${courseCode}, ` + error.message, "Error", "textToSpeech()", "Courses/{courseCode}/CreateContent")
            reject(error)
        }
    });
}

export async function createAudio(
    text: string,
    voice: string,
    language: string,
    courseCode: string,
    sectionIndex: number,
    elementIndex: number,
    paragraphIndex: number
): Promise<{ url: string, sectionIndex: number, elementIndex: number, paragraphIndex: number }> {

    const mp3Name = uuidv4() + ".mp3"
    try {
        const accessToken = await getAccessToken(TTS_SUBSCRIPTION_KEY, courseCode)
        const blobService = azure.createBlobService(AZURE_STORAGE_CONNECTION_STRING)
        const writableStream = blobService.createWriteStreamToBlockBlob(
            "speeches",
            mp3Name,
            {
                blockIdPrefix: "block",
                contentSettings: {
                    contentType: "audio/mpeg",
                },
            },
        )
        await textToSpeech(accessToken, text, writableStream, voice, language, courseCode)
        const audioUrl = blobService.getUrl("speeches") + "/" + mp3Name
        return { url: audioUrl, sectionIndex: sectionIndex, elementIndex: elementIndex, paragraphIndex: paragraphIndex }

    } catch (err) {
        await saveLog(`Error creating audio for course: ${courseCode}, sectionIndex ${sectionIndex}, elementIndex ${elementIndex}, paragraphIndex ${paragraphIndex}.`, "Error", "createAudio()", "Courses/{courseCode}/CreateContent")
        return { url: undefined, sectionIndex: sectionIndex, elementIndex: elementIndex, paragraphIndex: paragraphIndex }
    }
}
