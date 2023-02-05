import axios, { AxiosResponse } from 'axios'
import { BlobServiceClient } from '@azure/storage-blob'
import { Configuration, OpenAIApi } from 'openai'
import { titleExtraction } from "./gpt3.prompt"
import sharp = require('sharp')
import { v4 as uuidv4 } from 'uuid'
import { saveLog } from './saveLog'

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
    sectionTitle: string, 
    courseTitle: string, 
    imageAspect: string, 
    language: string, 
    imagesIds: string[], 
    courseCode:string): Promise<{ image: {}, thumb: {}, finalImage:{}, imagesIds: string[], urlBing: string }> {
    /*
    imageAspect	Filter images by the following aspect ratios:
    Square — Return images with standard aspect ratio.
    Wide — Return images with wide screen aspect ratio.
    Tall — Return images with tall aspect ratio.
    All — Do not filter by aspect. Specifying this value is the same as not specifying the aspect parameter.
    */

    const prompt = titleExtraction[language]["prompt"].
        replace(/v{text}/g, paragraph)
    let titleAIObj: any
    let imgByKeyword = ""
    try {
        titleAIObj = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.2,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        })
        imgByKeyword = titleAIObj.data.choices[0].text.replace(/[\r\n]/gm, '').trim()
    } catch (error) {
        console.error("Error trying to extract a title --> ", error)
        await saveLog(`Error trying to extract a title for course: ${courseCode}.`, "Error", "findImages()", "Courses/{courseCode}/CreateContent")
    }

    const imgQueryOptions = "&minWidth=1200&aspect=Wide&imageType=Photo"
    const bingUrlBase = "https://api.bing.microsoft.com/v7.0/images/search?q="
    let urlsBing: string[] = [

        bingUrlBase +
        encodeURIComponent(courseTitle + " " + sectionTitle + " " + imgByKeyword) +
        imgQueryOptions,

        bingUrlBase +
        encodeURIComponent(courseTitle + " " + sectionTitle) +
        imgQueryOptions,

        bingUrlBase +
        encodeURIComponent(courseTitle) +
        imgQueryOptions

    ]

    const searchImages = await searchBingImages(urlsBing[0], courseCode)

    let images: string[] = searchImages.data["value"]

    if (images.length > 0) {
        const item = images[0]
        const foundThumb = { url: item["thumbnailUrl"], width: item["thumbnail"]["width"], height: item["thumbnail"]["height"] }
        const foundImage = { url: item["contentUrl"], width: item["width"], height: item["height"], imageId: item["imageId"] }
        let finalImage = { url: "", width: 0, height: 0}
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
            //console.info("finalImage: 1", finalImage)
            return { image: foundImage, thumb: foundThumb, finalImage: finalImage, imagesIds: [], urlBing: urlsBing[0] }
        } catch (error) {
            await saveLog(`Error processing image for course: ${courseCode}, sectionTitle: ${sectionTitle}, foundImage.url: ${foundImage.url}`, "Error", "findImages()", "Courses/{courseCode}/CreateContent")
            return { image: foundImage, thumb: foundThumb, finalImage: {}, imagesIds: [], urlBing: urlsBing[0] }
        }
        
    } else {
        await saveLog(`Image not found for course: ${courseCode}, sectionTitle: ${sectionTitle}`, "Warning", "findImages()", "Courses/{courseCode}/CreateContent")

        return { image: {}, thumb: {}, finalImage: {}, imagesIds: [], urlBing: urlsBing[0] }

    }

}