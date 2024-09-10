import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

export type CreditCost = {
  code: string;
  name: string;
  credits: number;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const getCreditCosts = async () => {
    try {
      const db = await database;

      const CreditCosts = db.collection("creditCosts");

      const getCreditCostsResponse = await CreditCosts.find({}).toArray();

      if (getCreditCostsResponse && getCreditCostsResponse.length > 0) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: getCreditCostsResponse,
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
        `Error getting credit costs, error ${error.message}`,
        "Error",
        "getCreditCosts()",
        "CreditCosts/"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get credit costs",
      };
    }
  };

  const updateCreditCost = async () => {
    try {
      const db = await database;
      const CreditCosts = db.collection("creditCosts");

      const updateCreditResponse = await CreditCosts.findOneAndUpdate(
        { code: req.body.code },
        { $set: { credits: req.body.credits } }
      );

      if (updateCreditResponse) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: updateCreditResponse,
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating credit cost",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating credit cost: ${req.body.code}` + error.message,
        "Error",
        "updateCreditCost()",
        "CreditCost/"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating credit cost",
        },
      };
    }
  };

  switch (req.method) {
    case "GET":
      await getCreditCosts();
      break;
    case "PUT":
      await updateCreditCost();
      break;
    default:
      break;
  }
};

export default httpTrigger;
