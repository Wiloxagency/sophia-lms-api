import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  findImagesFromAssets,
  returnInitialImages,
} from "../CreateContent/findImages";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  async function getInitialImages() {
    const initialImages = await returnInitialImages();

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: initialImages,
    };
  }

  async function getFilteredImages() {
    const filteredImages = await findImagesFromAssets(
      req.query.topic,
      req.query.conversationContext,
      25
    );

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: filteredImages,
    };
  }

  switch (req.method) {
    case "GET":
      await getInitialImages();
      break;

    case "POST":
      req.query.getTitleAndDescriptionImages;
      await getFilteredImages();

      break;
    default:
      break;
  }
};

export default httpTrigger;
