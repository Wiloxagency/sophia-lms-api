import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import IPinfoWrapper, { IPinfo, AsnResponse } from "node-ipinfo";

const ipinfoWrapper = new IPinfoWrapper("68191b1738d0d5");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    let clientIp = req.headers["x-forwarded-for"];
    // CHILEAN IP 👇🏻
    // let clientIp = "101.44.15.255";

    // 'x-forwarded-for' can be a list of IPs, so we take the first one
    if (clientIp) {
      clientIp = clientIp.split(",")[0]; // If it's a list, take the first IP
      clientIp = clientIp.split(":")[0]; // Remove port number if present
    }

    const ipInfoResponse = await ipinfoWrapper.lookupIp(clientIp);

    // console.log("ipInfoResponse: ", ipInfoResponse);

    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        country: ipInfoResponse.country,
        countryCode: ipInfoResponse.countryCode,
        countryCurrency: ipInfoResponse.countryCurrency,
      },
    };
  } catch (error) {
    // console.error("Error getting geolocation ", error);
    await saveLog(
      `Error getting geolocation.`,
      "Error",
      "Geolocation()",
      "Geolocation/"
    );
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: error.toString(),
      },
    };
  }
};

export default httpTrigger;
