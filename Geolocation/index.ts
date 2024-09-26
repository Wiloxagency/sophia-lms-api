import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";
import { saveLog } from "../shared/saveLog";

import IPinfoWrapper, { IPinfo, AsnResponse } from "node-ipinfo";

const ipinfoWrapper = new IPinfoWrapper("68191b1738d0d5");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    console.log(req);

    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: req,
    };
    return;
    const clientIp = req.headers["x-forwarded-for"];
    context.res = {
      status: 200,
      body: { ip: clientIp },
    };
    console.log("clientIp: ", clientIp);

    ipinfoWrapper.lookupIp(clientIp).then((response: IPinfo) => {
      console.log(response);
    });

    // context.res = {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: { axiosResponse },
    // };
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
