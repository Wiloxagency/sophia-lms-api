import { AzureFunction } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

export const getRoles: AzureFunction = async () => {
  try {
    const db = await database;
    const Roles = db.collection("role");
    const resp = Roles.find({});
    const body = await resp.toArray();

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
          message: "Error creating role",
        },
      };
    }
  } catch (error) {
    await saveLog(
      `Error creating role:`,
      "Error",
      "createRole()",
      "Role/{roleCode?}"
    );
    return {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Error creating role",
      },
    };
  }
};
