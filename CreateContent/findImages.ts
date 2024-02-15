import { BlobServiceClient } from "@azure/storage-blob";
import { titleExtraction } from "./gpt3.prompt";
import { v4 as uuidv4 } from "uuid";
import { saveLog } from "../shared/saveLog";
import { extractTitle } from "./titleExtraction";
import axios, { AxiosResponse } from "axios";
import sharp = require("sharp");
import OpenAI from "openai";
import {
  getTopicCategories,
  topicCategories,
} from "../TopicCategorizer/categorizer";
import { createConnection } from "../shared/mongo";

const database = createConnection;

const OCP_APIM_SUBSCRIPTION_KEY = process.env.OCP_APIM_SUBSCRIPTION_KEY;
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Bing search engine
const configBing = {
  // EduFactory
  headers: {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": OCP_APIM_SUBSCRIPTION_KEY,
    Pragma: "no-cache",
  },
};

const imagesBlobContainerUrl =
  "https://sophieassets.blob.core.windows.net/assets/images/";

async function searchBingImages(urlBing: string, courseCode: string) {
  try {
    return await axios.get(urlBing, configBing).then(async (result) => {
      return result;
    });
  } catch (error) {
    console.error("Error searching Bing images --> ", error);
    await saveLog(
      `Error creating an image for course: ${courseCode}.`,
      "Error",
      "searchBingImages()",
      "Courses/{courseCode}/CreateContent"
    );

    return { data: { value: [] } };
  }
}

export async function returnInitialImages(): Promise<string[]> {
  const db = await database();
  const Assets = db.collection("assets");

  let images = await Assets.find({
    type: "image",
  }).toArray();

  let randomIndex;
  let selectedImage;
  let selectedImages = [];
  let imageUrl;

  let numberOfImages = 25;
  while (numberOfImages--) {
    randomIndex = Math.floor(Math.random() * images.length - 1);

    selectedImage = images[randomIndex];

    imageUrl =
      imagesBlobContainerUrl +
      selectedImage.file_name +
      "." +
      selectedImage.format;

    selectedImages.push(imageUrl);
  }

  // console.log(selectedImages);
  return selectedImages;
}

export async function findImagesFromAssets(
  topic: string,
  conversationContext: string,
  quantity: number
): Promise<
  | {
      image: {};
      thumb: {};
      finalImage: {};
      imagesIds: string[];
      urlBing: string;
    }
  | string[]
> {
  const db = await database();

  const getCategoriesResponse = await getTopicCategories(
    topic,
    conversationContext
  );

  let categoryNames = [];

  for (const categoryNumber of getCategoriesResponse.categories) {
    const isCategoryFound = topicCategories.find((element) =>
      element.includes(categoryNumber + ".")
    );
    if (isCategoryFound) {
      categoryNames.push(isCategoryFound.split(".")[1].trim().toLowerCase());
    }
  }

  const Assets = db.collection("assets");

  let matchingImages = await Assets.find({
    type: "image",
    categories: { $in: categoryNames },
  }).toArray();

  let randomIndex;
  let selectedImage;
  let selectedImages = [];
  let imageUrl;

  while (quantity--) {
    randomIndex = Math.floor(Math.random() * matchingImages.length - 1);
    selectedImage = matchingImages[randomIndex];
    imageUrl =
      imagesBlobContainerUrl +
      selectedImage.file_name +
      "." +
      selectedImage.format;

    selectedImages.push(imageUrl);
  }

  // console.log({
  //   url: imageUrl,
  //   width: selectedImage.scaled.X,
  //   height: selectedImage.scaled.Y,
  // });

  return quantity == 1
    ? {
        image: {},
        thumb: {},
        finalImage: {
          url: imageUrl,
          width: selectedImage.scaled.X,
          height: selectedImage.scaled.Y,
        },
        imagesIds: [],
        urlBing: "",
      }
    : selectedImages;
}

export async function findImages(
  paragraph: string,
  paragraphTitle: string,
  sectionTitle: string,
  courseTitle: string,
  imageAspect: string,
  languageName: string,
  imagesIds: string[],
  courseCode: string
): Promise<{
  image: {};
  thumb: {};
  finalImage: {};
  imagesIds: string[];
  urlBing: string;
}> {
  /*
    imageAspect	Filter images by the following aspect ratios:
    Square — Return images with standard aspect ratio.
    Wide — Return images with wide screen aspect ratio.
    Tall — Return images with tall aspect ratio.
    All — Do not filter by aspect. Specifying this value is the same as not specifying the aspect parameter.
    */

  const imgQueryOptions = "&minWidth=1200&aspect=Wide&imageType=Photo";
  const bingUrlBase = "https://api.bing.microsoft.com/v7.0/images/search?q=";
  let urlsBing: string[] = [
    bingUrlBase + encodeURIComponent(paragraphTitle) + imgQueryOptions,

    bingUrlBase +
      encodeURIComponent(courseTitle + " " + sectionTitle) +
      imgQueryOptions,

    bingUrlBase + encodeURIComponent(courseTitle) + imgQueryOptions,
  ];
  let searchImages: any;
  let images: string[] = [];
  const bingCycle = async (urlsBingIndex: number) => {
    searchImages = await searchBingImages(urlsBing[urlsBingIndex], courseCode);
    images = searchImages.data["value"];
    if (images.length == 0 && urlsBingIndex < 2) {
      await saveLog(
        `Response empty processing image for course: ${courseCode}, sectionTitle: ${sectionTitle}, trying: ${urlsBingIndex}`,
        "Warning",
        "findImages()",
        "Courses/{courseCode}/CreateContent"
      );
      await bingCycle(urlsBingIndex + 1);
    }
  };
  await bingCycle(0);

  if (images.length > 0) {
    let response: {
      image: {};
      thumb: {};
      finalImage: {};
      imagesIds: string[];
      urlBing: string;
    } = null;
    const saveImageCycle = async (retryCounter: number) => {
      let foundThumb: any = {};
      let foundImage: any = {};

      try {
        const item = images[retryCounter];
        foundThumb = {
          url: item["thumbnailUrl"],
          width: item["thumbnail"]["width"],
          height: item["thumbnail"]["height"],
        };
        foundImage = {
          url: item["contentUrl"],
          width: item["width"],
          height: item["height"],
          imageId: item["imageId"],
        };
        let finalImage = { url: "", width: 0, height: 0 };

        const input = (
          await axios({
            url: foundImage.url,
            responseType: "arraybuffer",
            timeout: 15000,
          })
        ).data as Buffer;
        const output = await sharp(input).resize(1200, 675).jpeg().toBuffer();
        const blobServiceClient = BlobServiceClient.fromConnectionString(
          AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient("images");
        const blobName = uuidv4() + ".jpeg";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(output, output.length);
        finalImage.url = blockBlobClient.url;
        finalImage.width = 1200;
        finalImage.height = 675;
        response = {
          image: foundImage,
          thumb: foundThumb,
          finalImage: finalImage,
          imagesIds: [],
          urlBing: urlsBing[0],
        };
      } catch (error) {
        if (retryCounter < 3 && images.length > retryCounter) {
          await saveLog(
            `Error downloading image for course: ${courseCode}, sectionTitle: ${sectionTitle}, foundImage.url: ${foundImage.url}, attempts: ${retryCounter}`,
            "Warning",
            "findImages()",
            "Courses/{courseCode}/CreateContent"
          );
          await saveImageCycle(retryCounter + 1);
        } else {
          await saveLog(
            `Error processing image for course: ${courseCode}, sectionTitle: ${sectionTitle}, foundImage.url: ${foundImage.url}`,
            "Error",
            "findImages()",
            "Courses/{courseCode}/CreateContent"
          );
          response = {
            image: foundImage,
            thumb: foundThumb,
            finalImage: {},
            imagesIds: [],
            urlBing: urlsBing[0],
          };
        }
      }
    };
    await saveImageCycle(0);
    return response;
  } else {
    await saveLog(
      `Image not found for course: ${courseCode}, sectionTitle: ${sectionTitle}`,
      "Warning",
      "findImages()",
      "Courses/{courseCode}/CreateContent"
    );

    return {
      image: {},
      thumb: {},
      finalImage: {},
      imagesIds: [],
      urlBing: urlsBing[0],
    };
  }
}
