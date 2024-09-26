import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import IPinfoWrapper, { IPinfo, AsnResponse } from "node-ipinfo";

const ipinfoWrapper = new IPinfoWrapper("68191b1738d0d5");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const clientIp = req.headers["x-forwarded-for"];

    const ipInfoResponse = ipinfoWrapper
      .lookupIp(clientIp)
      .then((response: IPinfo) => {
        //   console.log(response);
        return response;
      });

    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: { ipInfoResponse },
    };
  } catch (error) {
    console.error("Error getting geolocation ", error);
    await saveLog(
      `Error getting geolocation.`,
      "Error",
      "Geolocation()",
      "Geolocation/"
    );
  }
};

export default httpTrigger;
