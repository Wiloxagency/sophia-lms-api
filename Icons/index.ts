import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import OAuth from "oauth";

const clientKey = process.env.NOUN_PROJECT_KEY!;
const clientSecret = process.env.NOUN_PROJECT_SECRET!;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const searchQuery = req.query.query;

  if (!searchQuery) {
    context.res = {
      status: 400,
      body: { error: "Missing required 'query' parameter" },
    };
    return;
  }

  const oauth = new OAuth.OAuth(
    "https://api.thenounproject.com",
    "https://api.thenounproject.com",
    clientKey,
    clientSecret,
    "1.0",
    null,
    "HMAC-SHA1"
  );

  const url = `https://api.thenounproject.com/v2/icon?query=${encodeURIComponent(
    searchQuery
  )}&thumbnail_size=84`;

  return new Promise((resolve) => {
    oauth.get(url, null, null, (err, data) => {
      if (err) {
        context.log.error("Error fetching icons:", err);
        context.res = {
          status: err.statusCode || 500,
          body: {
            error: "Failed to fetch icons",
            details: err,
          },
        };
        return resolve();
      }

      context.res = {
        status: 200,
        body: JSON.parse(data),
      };
      return resolve();
    });
  });
};

export default httpTrigger;
