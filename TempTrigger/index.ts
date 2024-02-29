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
import { updateCourseTokens } from "../Course/courseTokenCounter";

// const database = createConnection;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  
  updateCourseTokens("01cbb7c9-915d-4cf4-9177-54460c745349", 1);

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: "Working",
  };
};

export default httpTrigger;
