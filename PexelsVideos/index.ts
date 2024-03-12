import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import { returnPexelsVideos } from "./shared";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    let pexelsVideosResponse = await returnPexelsVideos(req.body.query);

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: { response: pexelsVideosResponse },
    };
  } catch (error) {
    await saveLog(
      `Error getting Pexels videos, error ${error.message} with query ${req.body.query}`,
      "Error",
      "AzureFunction()",
      "PexelsVideos"
    );
    throw new Error("Error getting Pexels videos");
  }
};

export default httpTrigger;
