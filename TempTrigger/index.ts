import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: "Working",
  };
};

export default httpTrigger;
