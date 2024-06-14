import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import sharp = require("sharp");
import { OptionalId, Document, ObjectId } from "mongodb";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const createNotification = async () => {

    try {
      const db = await database;
      const Notifications = db.collection("notification");
      var notification: OptionalId<Document>;
      notification = req.body;
      notification["dataCreated"] = new Date();
      notification["author_code"] = req.headers.authorcode;
      notification["timestamp"] = new Date(notification["timestamp"]);
      notification["expiration_date"] = new Date(notification["expiration_date"]);

      const resp = Notifications.insertOne(notification);

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
            message: "Error creating notification",
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
          message: error.toString(),
        },
      };
    }
  };

  const updateNotification = async () => {

    try {
      const db = await database;
      const Notifications = db.collection("notification");

      const notification = req.body;

      if (notification["expiration_date"] !== undefined)
        notification["expiration_date"] = new Date(notification["expiration_date"]);

      const resp = Notifications.updateOne(
        { "_id": new ObjectId(req.headers.notificationcode) },
        { $set: notification }
      )

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
            message: "Error 1 updating notification by code",
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
          message: "Error updating notification by code",
        },
      };
    }
  };

  const getNotifications = async () => {

    try {
      const db = await database;
      const Notifications = db.collection("notification");
      const Hoy = new Date();

      const resp = Notifications.find({
        $and: [{ author_code: req.headers.authorcode },
        { expiration_date: { $gt: Hoy } }]
      });

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
            message: "Error getting notification by code",
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
          message: "Error getting notification by code" + error,
        },
      };
    }
  };

  const deleteNotification = async () => {
    try {
      const db = await database;
      const Notifications = db.collection("notification");

      const resp = Notifications.deleteOne({ "_id": new ObjectId(req.headers.notificationcode) });
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
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting notification by code",
        },
      };
    }
  }

  switch (req.method) {
    case "POST":
      await createNotification();
      break;

    case "PUT":

      await updateNotification();
      break;

    case "DELETE":

      await deleteNotification();
      break;

    case "GET":

      await getNotifications();
      break;

    default:
      break;
  }
};

export default httpTrigger
