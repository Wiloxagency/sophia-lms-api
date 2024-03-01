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
  
  updateCourseTokens("92de1258-8a31-4ea3-b380-9d4a6c0ea6ec", 1, 1);

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: "Working",
  };
};

export default httpTrigger;
