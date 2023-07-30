import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const createRole = async () => {
    try {
      const db = await database;
      const Roles = db.collection("role");
      const resp = Roles.insertOne(req.body);

      const body = await resp;

      if (body) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        context.res = {
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
        `Error creating role: ${req.body}` + error.message,
        "Error",
        "createRole()",
        "Role/{roleCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: error.toString(),
        },
      };
    }
  };

  const deleteRole = async () => {
    try {
      const db = await database;

      const Roles = db.collection("role");

      const resp = Roles.deleteOne({ code: req.params.roleCode });
      const body = await resp;

      if (body) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },

          body: body,
        };
      }
    } catch (error) {
      await saveLog(
        `Error deleting role by code: ${req.body.role.code}` + error.message,
        "Error",
        "deleteRole()",
        "Role/{roleCode?}"
      );
    }
  };

  const updateRole = async (roleCode: string) => {
    delete req.body._id;

    try {
      const db = await database;
      const Roles = db.collection("role");

      const resp = Roles.findOneAndUpdate(
        { code: roleCode },
        { $set: req.body }
      );
      const body = await resp;

      if (body) {
        context.res = {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating role by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating role by code: ${req.body.role.code}` + error.message,
        "Error",
        "updateRole()",
        "Role/{roleCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating role by code",
        },
      };
    }
  };

  const getRole = async (roleCode: string) => {
    try {
      const db = await database;
      const Roles = db.collection("role");

      const resp = Roles.aggregate([
        {
          $match: {
            code: roleCode,
          },
        },
      ]);

      const body = await resp.toArray();

      if (body && body[0]) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error getting role by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting role by code: ${req.body.role.code} ` + error.message,
        "Error",
        "getRole()",
        "Role/{roleCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting role by code",
        },
      };
    }
  };

  const getRoles = async () => {
    try {
      const db = await database;

      const Roles = db.collection("role");

      const resp = Roles.find({});

      const body = await resp.toArray();

      if (body && body.length > 0) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
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
        `Error getting roles, error ${error.message}`,
        "Error",
        "getRoles()",
        "Role/{roleCode?}"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get roles",
      };
    }
  };

  switch (req.method) {
    case "POST":
      await createRole();
      break;
    case "PUT":
      await updateRole(req.params.roleCode);
      break;
    case "GET":
      if (req.params.roleCode) {
        await getRole(req.params.roleCode);
      } else {
        await getRoles();
      }

      break;
    case "DELETE":
      await deleteRole();
      break;
    default:
      break;
  }
};

export default httpTrigger;
