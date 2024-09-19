import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { ObjectId } from "mongodb";
import { returnDecryptedString } from "../shared/stringEncryption";
import { saveLog } from "../shared/saveLog";
const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const db = await database;
  const users = db.collection("user");

  try {
    const decryptedId = new ObjectId(
      returnDecryptedString(req.body.encryptedId)
    );

    const activateUserResponse = await users.findOneAndUpdate(
      { _id: decryptedId },
      { $set: { status: "Activo" } },
      { returnDocument: "after" }
    );
    // console.log("activateUserResponse: ", activateUserResponse);

    if (activateUserResponse.value.status === "Activo") {
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: { message: "Email verified" },
      };
    } else {
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: { message: "Email could not be verified" },
      };
    }
  } catch (error) {
    await saveLog(
      `Error validating email, error ${error.message}`,
      "Error",
      "emailValidation()",
      "emailValidation/"
    );

    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      statusText: `Error validating user. Error: ${error.message}`,
    };
  }
};

export default httpTrigger;
