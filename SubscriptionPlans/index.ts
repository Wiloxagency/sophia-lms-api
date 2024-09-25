import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

type SubscriptionPlan = {
  name: string;
  credits: number;
  prices: {
    USD: number;
    EUR: number;
    CLP: number;
    BRL: number;
  };
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const getSubscriptionPlans = async () => {
    try {
      const db = await database;

      const subscriptionPlans = db.collection("subscriptionPlans");

      const getSubscriptionPlansResponse = await subscriptionPlans
        .find({})
        .toArray();

      if (
        getSubscriptionPlansResponse &&
        getSubscriptionPlansResponse.length > 0
      ) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: getSubscriptionPlansResponse,
        };
      } else {
        context.res = {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting plans, error ${error.message}`,
        "Error",
        "getSubscriptionPlans()",
        "SubscriptionPlans/"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get plans",
      };
    }
  };

  const updateSubscriptionPlan = async () => {
    try {

      const db = await database;
      const subscriptionPlans =
        db.collection<SubscriptionPlan>("subscriptionPlans");

      const updateSubscriptionPlanResponse =
        await subscriptionPlans.findOneAndUpdate(
          { name: req.body.planName },
          { $set: { [req.body.field]: req.body.value } }
        );

      if (updateSubscriptionPlanResponse) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: updateSubscriptionPlanResponse,
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating subcsription plan",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating subcsription plan: ${req.body.code}` + error.message,
        "Error",
        "updateSubscriptionPlan()",
        "SubscriptionPlan/"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating subcsription plan",
        },
      };
    }
  };

  switch (req.method) {
    case "GET":
      await getSubscriptionPlans();
      break;
    case "PUT":
      await updateSubscriptionPlan();
      break;
    default:
      break;
  }
};

export default httpTrigger;
