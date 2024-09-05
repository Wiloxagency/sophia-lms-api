import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
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
    case "PUT":
      await updateCreditCost();
      break;
  }
};

export default httpTrigger;
