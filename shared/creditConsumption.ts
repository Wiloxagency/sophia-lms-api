import { CreditCost } from "../CreditCosts";
import { createConnection } from "./mongo";

const database = createConnection();

export async function updateUserCreditConsumption(
  creditCostCode: "eiv" | "cl" | "ce" | "cpc" | "ar" | "dsc",
  userCode: string
) {
  try {
    const db = await database;

    const creditCosts = db.collection<CreditCost>("creditCosts");
    const users = db.collection("user");
    const creditCost = (await creditCosts.findOne({ code: creditCostCode }))
      .credits;

    const updateUserResponse = await users.updateOne(
      { code: userCode },
      {
        $inc: {
          credits: -creditCost,
        },
      }
    );

    console.log(updateUserResponse);
  } catch (error) {
    console.log(error);
  }
}
