import { CreditCost } from "../CreditCosts";
import { createConnection } from "./mongo";

const database = createConnection();

const validCreditCostCodes = ["eiv", "cl", "ce", "cpc", "ar", "dsc"] as const;

export type CreditCostCodes = (typeof validCreditCostCodes)[number];

// Helper function to check if a string is a valid CreditCostCode
export function isValidCreditCostCode(code: string): code is CreditCostCodes {
  return validCreditCostCodes.includes(code as CreditCostCodes);
}

export async function updateUserCreditConsumption(
  userCode: string,
  creditCostCode: CreditCostCodes
) {
  try {
    const db = await database;

    const creditCosts = db.collection<CreditCost>("creditCosts");
    const users = db.collection("user");
    const creditCost = (await creditCosts.findOne({ code: creditCostCode }))
      .credits;

    const updateUserResponse = await users.findOneAndUpdate(
      { code: userCode },
      {
        $inc: {
          credits: -creditCost,
        },
      },
      { returnDocument: "after" }
    );

    return updateUserResponse.value.credits as number;
  } catch (error) {
    console.log(error);
  }
}
