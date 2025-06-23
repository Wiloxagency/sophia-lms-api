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
  const jobTitle: string = req.query.job || req.body?.job;
  const inputSource: "typed" | "selected" =
    req.query.isOccupationTypedOrSelected ||
    req.body?.isOccupationTypedOrSelected;

  context.log("🧾 jobTitle:", jobTitle);
  context.log("📌 inputSource:", inputSource);

  if (!jobTitle) {
    context.res = {
      status: 400,
      body: { error: "Missing required 'job' parameter." },
    };
    return;
  }

  try {
    const Labels = db.collection("occupationLabels");
    const occupationLabels = await Labels.find().toArray();
    const knownOccupations = occupationLabels.map((l: any) => l.name);

    let matchResult:
      | {
          found: true;
          matchedOccupation: string;
          considered: string[];
        }
      | {
          found: false;
          reason: string;
        };

    if (inputSource === "selected") {
      const exists = knownOccupations.includes(jobTitle);
      if (!exists) {
        context.res = {
          status: 400,
          body: {
            found: false,
            reason: "La ocupación seleccionada no existe en la base de datos.",
          },
        };
        return;
      }

      matchResult = {
        found: true,
        matchedOccupation: jobTitle,
        considered: [jobTitle],
      };
    } else {
      matchResult = await resolveOccupationMatch(jobTitle, knownOccupations);
    }

    if (!matchResult.found) {
      context.res = {
        status: 200,
        body: {
          found: false,
          reason:
            "reason" in matchResult ? matchResult.reason : "Unknown reason",
        },
      };
      return;
    }

    const matches = matchResult.considered;
    // context.log("✅ Matches considered by assistant:", matches);

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
    // context.log("🗣️ translatedMatches:", translatedMatches);

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

    const occupationName = matches[0];
    // context.log("🎯 occupationName:", occupationName);

    const taskResult = await getTasksForOccupation(db, occupationName);
    // context.log("🧩 taskResult:", taskResult);

    const translatedTasks = await translateStrings(taskResult.tasks, jobTitle);
    // console.log(" translatedTasks: ", translatedTasks)

    const { tasks: _, ...otherTaskResultFields } = taskResult;

    context.res = {
      status: 200,
      body: {
        tasks: translatedTasks,
        ...otherTaskResultFields,
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
