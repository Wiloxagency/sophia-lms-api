import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MongoClient } from "mongodb";

export const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {
  const getLogs = async (
    type: string,
    search: string,
    data: string,
    skip: string,
    items_by_page: string
  ) => {
    try {
      const db = client.db();
      const collection = db.collection("log");

      const regexSearch = new RegExp(search, "i"); // "i" indica que a busca é case-insensitive
      const querySearch = {
        $or: [
          { message: { $regex: regexSearch } },
          { endpoint: { $regex: regexSearch } },
          { functionName: { $regex: regexSearch } },
          { timestamp: { $regex: regexSearch } },
        ],
      };

      const regexData = new RegExp(data, "i");
      const queryData = { timestamp: { $regex: regexData } };

      const regexType = new RegExp(type, "i");
      const queryType = { logType: { $regex: regexType } };

      const skipNum = parseInt(skip);

      const limitNum = parseInt(items_by_page);

      const body = await collection
        .find(Object.assign(queryType, queryData, querySearch))
        .skip(skipNum)
        .limit(limitNum)
        .sort({ _id: -1 })
        .toArray();

      if (body) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        return {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "No logs found",
          },
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting logs",
        },
      };
    }
  };

  switch (req.method) {
    case "GET":
      return await getLogs(
        req.query.type,
        req.query.search,
        req.query.data,
        req.query.skip,
        req.query.items_by_page
      );

    default:
      break;
  }
};

export default httpTrigger;
