import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createDallePrompt } from "../CreateContent/asyncCreateDallePrompt";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  console.log(req.body);
  const prompt = ""
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: {"prompt": prompt},
  };
};

export default httpTrigger;
