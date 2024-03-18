import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { returnParsedHtmlString } from "./shared";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let parsedHtmlStringResponse = await returnParsedHtmlString(req.body.data);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: parsedHtmlStringResponse,
  };
};

export default httpTrigger;
