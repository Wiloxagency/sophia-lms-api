import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createTranscriptionJob } from "../shared/azureSpeechToText";
import { returnLanguageAndLocaleFromLanguage } from "../shared/languages";
import { returnRandomLocalImage } from "../shared/localImages";
import { returnInitialImages } from "../CreateContent/findImages";
import {
  getTopicCategories,
  getTopicCategoryNamesFromNumbers,
} from "../TopicCategorizer/categorizer";
import { createConnection } from "../shared/mongo";

// const database = createConnection;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // const db = await database();

  // const Assets = db.collection("assets");

  // let categoryNames = await getTopicCategoryNamesFromNumbers([15]);

  // const matchingImages = await Assets.find({
  //   type: "image",
  //   categories: { $in: categoryNames },
  // }).toArray();

  // console.log(matchingImages);

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: "Working",
  };
};

export default httpTrigger;
