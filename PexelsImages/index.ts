import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import { returnPexelsImages } from "./shared";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    let responseImages = await returnPexelsImages(
      req.body.query,
      req.body.isOrientationLandscape
    );

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: { response: responseImages },
    };
  } catch (error) {
    await saveLog(
      `Error getting Pexels images, error ${error.message} with query ${req.body.query}`,
      "Error",
      "AzureFunction()",
      "PexelsImages"
    );
    throw new Error(`Error getting Pexels images, error ${error.message}`);
  }
};

export default httpTrigger;
