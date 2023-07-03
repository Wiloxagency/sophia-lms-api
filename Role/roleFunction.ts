import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MongoClient } from "mongodb";

export const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {
  const createRole = async () => {
    try {
      const db = client.db();
      const Roles = db.collection("role");
      const resp = Roles.insertOne(req.body);

      const body = await resp;

      if (body) {
        return {
          status: 201,
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
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const deleteRole = async (roleCode: string) => {
    try {
      const db = client.db();
      const Roles = db.collection("role");

      const resp = Roles.deleteOne({ code: roleCode });
      const body = await resp;

      if (body) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },

          body: body,
        };
      }
    } catch (error) {
      ("Error cathc");
    }
  };

  const updateRole = async (roleCode: string) => {
    delete req.body._id;

    try {
      const db = client.db();
      const Roles = db.collection("role");
      const resp = Roles.findOneAndUpdate(
        { code: roleCode },
        { $set: req.body }
      );
      const body = await resp;

      if (body) {
        return {
          status: 201,
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
            message: "Error updating role by code",
          },
        };
      }
    } catch (error) {
      return {
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
      const db = client.db();
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
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        return {
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
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const getRoles = async () => {
    try {
      const db = client.db();
      const Roles = db.collection("role");
      const resp = Roles.find({});
      const body = await resp.toArray();

      if (body && body.length > 0) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      } else {
        return {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    } catch (error) {
      return {
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
      return await createRole();
    case "PUT":
      return await updateRole(req.params.roleCode);
    case "GET":
      if (req.params.roleCode) {
        return await getRole(req.params.roleCode);
      } else {
        return await getRoles();
      }
    case "DELETE":
      return await deleteRole(req.params.roleCode);
  }
};
