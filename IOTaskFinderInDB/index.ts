import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MongoClient, ServerApiVersion } from "mongodb";
import { resolveOccupationMatch } from "./resolveOccupationMatch";
import { translateStrings } from "./translateString";
import { getTasksForOccupation } from "./getTasksForOccupation";

// MongoDB setup
const mongoConfig = {
  url: process.env.MONGODB_ATLAS_URI!,
  dbName: "oi",
};
const options = {
  connectTimeoutMS: 100000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
};

const client = new MongoClient(mongoConfig.url, options);
const db = client.db(mongoConfig.dbName);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const jobTitle = req.query.job || req.body?.job;
  context.log("🧾 jobTitle:", jobTitle);

  if (!jobTitle) {
    context.res = {
      status: 400,
      body: { error: "Missing required 'job' parameter." },
    };
    return;
  }

  try {
    // Load known occupations
    const Labels = db.collection("occupationLabels");
    const occupationLabels = await Labels.find().toArray();
    const knownOccupations = occupationLabels.map((l: any) => l.name);

    // Resolve match via assistant
    const matchResult = await resolveOccupationMatch(
      jobTitle,
      knownOccupations
    );

    if (!matchResult.found) {
      const reason =
        "reason" in matchResult ? matchResult.reason : "Unknown reason";
      context.res = {
        status: 200,
        body: {
          found: false,
          reason,
        },
      };
      return;
    }

    const matches = matchResult.considered                                                                                                                      ;

    // Log all possible matches and selected one
    context.log("✅ Matches considered by assistant:", matches);

    if (matches.length === 0) {
      context.res = {
        status: 200,
        body: {
          found: false,
          reason: "No se encontraron coincidencias.",
        },
      };
      return;
    }

    const translatedMatches = await translateStrings(matches, jobTitle);
    console.log(" translatedMatches: ", translatedMatches)

    if (matches.length > 1) {
      context.res = {
        status: 200,
        body: {
          found: false,
          multiple: true,
          message:
            "Se encontraron múltiples ocupaciones posibles. Por favor elige una.",
          options: translatedMatches,
          originalOptions: matches,
        },
      };
      return;
    }

    // One match: get tasks
    const occupationName = matches[0];
    const taskResult = await getTasksForOccupation(db, occupationName);

    context.res = {
      status: 200,
      body: {
        ...taskResult,
        occupationName,
      },
    };
  } catch (err: any) {
    context.log.error("❌ Error in IOTaskFinderInDB:", err);
    context.res = {
      status: 500,
      body: {
        error: "Internal server error",
        detail: err.message,
      },
    };
  }
};

export default httpTrigger;
