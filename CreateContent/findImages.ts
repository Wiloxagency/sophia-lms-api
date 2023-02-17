import axios, { AxiosResponse } from 'axios'
import { BlobServiceClient } from '@azure/storage-blob'
import { Configuration, OpenAIApi } from 'openai'
import { titleExtraction } from "./gpt3.prompt"
import sharp = require('sharp')
import { v4 as uuidv4 } from 'uuid'
import { saveLog } from '../shared/saveLog'
import { extractTitle } from './titleExtraction'

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)

const OCP_APIM_SUBSCRIPTION_KEY = process.env.OCP_APIM_SUBSCRIPTION_KEY
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

// Bing search engine
const configBing = {
    // EduFactory
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': OCP_APIM_SUBSCRIPTION_KEY,
        'Pragma': 'no-cache'
    }
}

async function searchBingImages(urlBing: string, courseCode: string) {
    try {
        return await axios.get(urlBing, configBing).then(async result => { return result })
    } catch (error) {

        console.error("Error searching Bing images --> ", error)
        await saveLog(`Error creating an image for course: ${courseCode}.`, "Error", "searchBingImages()", "Courses/{courseCode}/CreateContent")

        return { data: { value: [] } }
    }

}

export async function findImages(
    paragraph: string,
    paragraphTitle: string,
    sectionTitle: string,
    courseTitle: string,
    imageAspect: string,
    language: string,
    imagesIds: string[],
    courseCode: string): Promise<{ image: {}, thumb: {}, finalImage: {}, imagesIds: string[], urlBing: string }> {
    /*
    imageAspect	Filter images by the following aspect ratios:
    Square — Return images with standard aspect ratio.
    Wide — Return images with wide screen aspect ratio.
    Tall — Return images with tall aspect ratio.
    All — Do not filter by aspect. Specifying this value is the same as not specifying the aspect parameter.
    */


    const imgQueryOptions = "&minWidth=1200&aspect=Wide&imageType=Photo"
    const bingUrlBase = "https://api.bing.microsoft.com/v7.0/images/search?q="
    let urlsBing: string[] = [

        bingUrlBase +
        encodeURIComponent(courseTitle + " " + sectionTitle + " " + paragraphTitle) +
        imgQueryOptions,

        bingUrlBase +
        encodeURIComponent(courseTitle + " " + sectionTitle) +
        imgQueryOptions,

        bingUrlBase +
        encodeURIComponent(courseTitle) +
        imgQueryOptions

    ]
    let searchImages: any
    let images: string[] = []
    const bingCycle = async (urlsBingIndex: number) => {
        searchImages = await searchBingImages(urlsBing[urlsBingIndex], courseCode)
        images = searchImages.data["value"]
        if (images.length == 0 && urlsBingIndex < 2) {
            await saveLog(`Response empty processing image for course: ${courseCode}, sectionTitle: ${sectionTitle}, trying: ${urlsBingIndex}`, "Warning", "findImages()", "Courses/{courseCode}/CreateContent")
            await bingCycle(urlsBingIndex + 1)
        }
    }
    await bingCycle(0)

    if (images.length > 0) {

        let response: { image: {}, thumb: {}, finalImage: {}, imagesIds: string[], urlBing: string } = null
        const saveImageCycle = async (retryCounter: number) => {

            const item = images[retryCounter]
            const foundThumb = { url: item["thumbnailUrl"], width: item["thumbnail"]["width"], height: item["thumbnail"]["height"] }
            const foundImage = { url: item["contentUrl"], width: item["width"], height: item["height"], imageId: item["imageId"] }
            let finalImage = { url: "", width: 0, height: 0 }
            try {
                const input = (await axios({ url: foundImage.url, responseType: "arraybuffer" })).data as Buffer
                const output = await sharp(input)
                    .resize(1200, 675)
                    .jpeg()
                    .toBuffer();
                const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
                const containerClient = blobServiceClient.getContainerClient("images")
                const blobName = uuidv4() + ".jpeg"
                const blockBlobClient = containerClient.getBlockBlobClient(blobName)
                await blockBlobClient.upload(output, output.length)
                finalImage.url = blockBlobClient.url
                finalImage.width = 1200
                finalImage.height = 675
                console.info("finalImage -->", finalImage)
                response = { image: foundImage, thumb: foundThumb, finalImage: finalImage, imagesIds: [], urlBing: urlsBing[0] }
            } catch (error) {
                if (retryCounter < 3 && images.length > retryCounter) {
                    await saveLog(`Error downloading image for course: ${courseCode}, sectionTitle: ${sectionTitle}, foundImage.url: ${foundImage.url}, attempts: ${retryCounter}`, "Warning", "findImages()", "Courses/{courseCode}/CreateContent")
                    await saveImageCycle(retryCounter + 1)
                } else {
                    await saveLog(`Error processing image for course: ${courseCode}, sectionTitle: ${sectionTitle}, foundImage.url: ${foundImage.url}`, "Error", "findImages()", "Courses/{courseCode}/CreateContent")
                    response = { image: foundImage, thumb: foundThumb, finalImage: {}, imagesIds: [], urlBing: urlsBing[0] }
                }
                
            }

        }
        await saveImageCycle(0)
        return response

    } else {
        await saveLog(`Image not found for course: ${courseCode}, sectionTitle: ${sectionTitle}`, "Warning", "findImages()", "Courses/{courseCode}/CreateContent")

        return { image: {}, thumb: {}, finalImage: {}, imagesIds: [], urlBing: urlsBing[0] }

    }

}