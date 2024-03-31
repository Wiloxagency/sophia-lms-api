import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import axios, { AxiosResponse } from "axios";

const LANGUAGE_IDENTIFIER_SUBSCRIPTION_KEY =
  process.env.LANGUAGE_IDENTIFIER_SUBSCRIPTION_KEY;
const requestConfiguration = {
  // EduFactory
  headers: {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": LANGUAGE_IDENTIFIER_SUBSCRIPTION_KEY,
  },
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const body = await axios
      .post(
        "https://sophia-services-language.cognitiveservices.azure.com/language/:analyze-text?api-version=2022-05-01",
        req.body,
        requestConfiguration
      )
      .then(async (result) => {
        console.log(result.data.documents);
        return result;
      });
    if (body) {
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: body.data,
      };
    }
  } catch (error) {
    await saveLog(
      `Error identifying language. ` + error.message,
      "Error",
      "languageIdentifier()",
      "LanguageIdentifier"
    );
  }
};

export default httpTrigger;
