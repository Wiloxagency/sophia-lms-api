import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import sharp = require("sharp");
import { v4 as uuidv4 } from 'uuid';

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const createSubscription = async () => {

    try {
      const db = await database;
      const Subscriptions = db.collection("subscription");
      const subscription = req.body;
      subscription["code"] = uuidv4();
      subscription["author_code"] = req.headers.authorcode;
      subscription["dataCreated"] = new Date();
      subscription["start_date"] = new Date(subscription["start_date"]);
      subscription["expiration_date"] = new Date(subscription["expiration_date"]);

      const exist = await Subscriptions.findOne({ author_code: req.headers.authorcode });
      if (exist) {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error creating subscription, the author: " + req.headers.authorCode + " already has a subscription",
          },
        };
      } else {

        const resp = Subscriptions.insertOne(subscription);

        const body = await resp;

        if (body) {
          updateFreelanceFromSubscription(subscription);
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
              message: "Error creating subscription",
            },
          };
        }
      }
    } catch (error) {
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

  const updateSubscription = async () => {
    try {
      const db = await database;
      const Subscriptions = db.collection("subscription");

      const subscription = req.body;

      if (subscription["expiration_date"] === undefined)
        subscription["start_date"] = new Date(subscription["start_date"]);

      if (subscription["start_date"] === undefined) {

        subscription["expiration_date"] = new Date(subscription["expiration_date"]);

        if (subscription["expiration_date"] < new Date())
          subscription["status"] = "Inactiva";
        else
          subscription["status"] = "Activa";
      }

      const options = { upsert: true, returnOriginal: false };

      const body = await Subscriptions.findOneAndUpdate({ author_code: req.headers.authorcode }, { $set: subscription }, options);

      if (body) {
        subscription["author_code"] = req.headers.authorcode;
        subscription["code"] = body.value.code;

        if (subscription["expiration_date"] === undefined)
          subscription["expiration_date"] = body.value.expiration_date;
        if (subscription["start_date"] === undefined)
          subscription["start_date"] = body.value.start_date;

        updateFreelanceFromSubscription(subscription);
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
            message: "Error 1 updating subscription by code",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating subscription by code",
        },
      };
    }
  };

  const getSubscription = async () => {
    var query: { author_code?: string; code?: string; };

    if (req.headers.authorcode) {
      query = {
        author_code: req.headers.authorcode
      }
    } else {
      query = {
        code: req.headers.subscriptioncode
      }
    }

    try {
      const db = await database;
      const Subscriptions = db.collection("subscription");

      const resp = Subscriptions.aggregate([
        {
          $match: query
        }
      ]);

      const body = await resp.toArray();

      if (body[0]) {

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
            message: "Error getting subscription by code",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting subscription by code",
        },
      };
    }
  };

  const deleteSubscription = async () => {
    try {
      const db = await database;
      const Subscriptions = db.collection("subscription");

      const resp = Subscriptions.deleteOne({ author_code: req.headers.authorcode });
      const body = await resp;
      if (body) {
        //updateFreelanceFromSubscription(null, true);
        deleteFreelanceSubscription(req.headers.authorcode);
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting subscription by code",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      await createSubscription();
      break;

    case "PUT":

      await updateSubscription();
      break;

    case "DELETE":

      await deleteSubscription();
      break;

    case "GET":
      //obtener por autor y codigo de suscripcion
      await getSubscription();

      break;

    default:
      break;
  }
};

async function updateFreelanceFromSubscription(subscription: string) {

  let document = null;

  //verificar estructura del documento

    var status: string;
    if (subscription["expiration_date"] < new Date())
      status = "Inactiva";
    else
      status = "Activa";

    const subscriptionDetail = {
      "code": subscription["code"],
      "status": status,
      "start_date": subscription["start_date"],
      "expiration_date": subscription["expiration_date"]
    }

    document = {
      "subscription": subscriptionDetail
    }
 

  try {
    const db = await database;
    const Users = db.collection("freelanceUser");
    const resp = Users.findOneAndUpdate(
      { code: subscription["author_code"] },
      { $set: document }
    );

    const body = await resp;

    if (body) {
      return {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: body
      };
    } else {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating user freelance by email",
        }
      };
    }
  } catch (error) {
    return {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Error updating user freelance by email",
      }
    };
  }
};

async function deleteFreelanceSubscription(author_code: string) {

  try {
    const db = await database;
    const Users = db.collection("freelanceUser");
    const resp = Users.findOneAndUpdate(
      { code: author_code },
      { $unset: {subscription:""} }
    );

    const body = await resp;

    if (body) {
      return {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: body
      };
    } else {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating user freelance by email",
        }
      };
    }
  } catch (error) {
    return {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Error updating user freelance by email",
      }
    };
  }
};

export default httpTrigger
