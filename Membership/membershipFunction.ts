import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { saveLog } from "../shared/saveLog";
import { MongoClient } from "mongodb";

export const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {
  const createMembership = async () => {
    try {
      const db = client.db();
      const Memberships = db.collection("membership");
      const resp = Memberships.insertOne(req.body);

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
            message: "Error creating membership",
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

  const deleteMembership = async () => {
    try {
      const db = client.db();

      const Memberships = db.collection("membership");

      const resp = Memberships.deleteOne({ code: req.params.code });
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
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting membership by code",
        },
      };
    }
  };

  const updateMembership = async (code: string) => {
    delete req.body._id;

    try {
      const db = client.db();
      const Memberships = db.collection("membership");

      const resp = Memberships.findOneAndUpdate(
        { code: code },
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
            message: "Error updating membership by code",
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
          message: "Error updating membership by code",
        },
      };
    }
  };

  const getMembership = async (code: string) => {
    try {
      const db = client.db();
      const Memberships = db.collection("membership");

      const resp = Memberships.aggregate([
        {
          $match: {
            code: code,
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
            message: "Error getting membership by code",
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
          message: "Error getting membership by code",
        },
      };
    }
  };

  const getMemberships = async () => {
    try {
      const db = client.db();

      const Memberships = db.collection("membership");

      const resp = Memberships.find({});

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
        body: {
          message: "Can't get memberships",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      return await createMembership();

    case "PUT":
      return await updateMembership(req.params.code);

    case "GET":
      if (req.params.code) {
        return await getMembership(req.params.code);
      } else {
        return await getMemberships();
      }
    case "DELETE":
      return await deleteMembership();

    default:
      break;
  }
};

export default httpTrigger;
