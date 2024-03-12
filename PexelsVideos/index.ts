import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createClient } from "pexels";
import { translateQuery } from "../shared/translator";
import { saveLog } from "../shared/saveLog";

const client = createClient(
  "mtCEdnRigTAFPj5nELvf5XSfjwfslcwz1qGfCf0gj1EZ57XCh3KraNns"
);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let query = req.body.query;
  try {
    let translatedQuery = await translateQuery(query);
    query = translatedQuery;
    let responseVideos = await client.videos.search({
      query,
      per_page: 80,
      orientation: "landscape",
    });
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: { response: responseVideos },
    };
  } catch (error) {
    await saveLog(
      `Error getting Pexels videos, error ${error.message} with query ${query}`,
      "Error",
      "AzureFunction()",
      "PexelsVideos"
    );
    throw new Error("Error getting Pexels videos");
  }
};

export async function returnPexelsVideos(query: string) {
  let translatedQuery = await translateQuery(query);
  query = translatedQuery;
  let responseVideos = await client.videos.search({
    query,
    per_page: 80,
    orientation: "landscape",
  });
  return responseVideos;
}

export default httpTrigger;
