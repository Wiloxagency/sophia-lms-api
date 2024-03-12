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
    // let translatedQuery = await translateQuery(query)
    // query = translatedQuery
    let responseImages = await client.photos.search({
      query,
      per_page: 80,
      orientation: "landscape",
    });

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: { response: responseImages },
    };
  } catch (error) {
    await saveLog(
      `Error getting Pexels images, error ${error.message} with query ${query}`,
      "Error",
      "AzureFunction()",
      "PexelsImages"
    );
    throw new Error(`Error getting Pexels images, error ${error.message}`);
  }
};

export async function returnPexelsImages(query: string) {
  let responseImages = await client.photos.search({
    query,
    per_page: 80,
    orientation: "landscape",
  });
  return responseImages;
}

export default httpTrigger;
