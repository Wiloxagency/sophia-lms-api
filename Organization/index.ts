import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const createOrganization = async () => {
    try {
      const db = await database;
      const Organizations = db.collection("organization");
      const organization = req.body;
      organization.creationDate = new Date();
      const resp = Organizations.insertOne(organization);

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
            message: "Error creating organization",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error creating organization: ${req.body.organizationCode}, error: ${error.message} `,
        "Error",
        "createOrganization()",
        "Organization/{organizationCode?}"
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

  const deleteOrganization = async (organizationCode: string) => {
    try {
      const db = await database;
      const usersInOrganization = db.collection("user");
      const coursesInOrganization = db.collection("course");

      const usersCount = await usersInOrganization.countDocuments({
        organizationCode: organizationCode,
      });
      const coursesCount = await coursesInOrganization.countDocuments({
        organizationCode: organizationCode,
      });

      if (usersCount || coursesCount) {
        context.res = {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },

          body: {
            message:
              "This organization cannot be deleted as it has a user or course.",
          },
        };
      } else {
        const Organizations = db.collection("organization");

        const resp = Organizations.deleteOne({
          organizationCode: organizationCode,
        });
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
      }
    } catch (error) {
      await saveLog(
        `Error deleting organization: ${req.body.organizationCode}, error: ${error.message} `,
        "Error",
        "deleteOrganization()",
        "Organization/{organizationCode?}"
      );
    }
  };

  const updateOrganization = async (organizationCode: string) => {
    delete req.body._id;

    try {
      const db = await database;
      const Organizations = db.collection("organization");

      const resp = Organizations.findOneAndUpdate(
        { organizationCode: organizationCode },
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
        await saveLog(
          `Error updating organization by code: ${req.body.organizationCode}`,
          "Error",
          "deleteOrganization()",
          "Organization/{organizationCode?}"
        );

        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating organization by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating organization by code: ${req.body.organizationCode}, error ${error.message}`,
        "Error",
        "deleteOrganization()",
        "Organization/{organizationCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating organization by code",
        },
      };
    }
  };

  const getOrganization = async (organizationCode: string) => {
    try {
      const db = await database;
      const Organizations = db.collection("organization");

      const resp = Organizations.aggregate([
        {
          $match: {
            organizationCode: organizationCode,
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
        await saveLog(
          `Error getting organization by code: ${req.body.organizationCode}`,
          "Error",
          "getOrganization()",
          "Organization/{organizationCode?}"
        );

        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error getting organization by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error getting organization by code: ${req.body.organizationCode}, error ${error.message}`,
        "Error",
        "getOrganization()",
        "Organization/{organizationCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting organization by code",
        },
      };
    }
  };

  const getOrganizations = async () => {
    try {
      const db = await database;

      const Organizations = db.collection("organization");

      const resp = Organizations.find({});

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
        `Error getting organizations, error ${error.message}`,
        "Error",
        "getOrganizations()",
        "Organization/{organizationCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        statusText: "Can't get organizations",
      };
    }
  };

  const postOrganizationFolder = async () => {
    delete req.body._id;

    try {
      const db = await database;
      const Organizations = db.collection("organization");

      console.log(req.body)
      console.log(req.params.organizationCode)

      const resp = Organizations.updateOne(
        { organizationCode: req.params.organizationCode },
        {
          $push: { "repository.repositoryFolders": req.body }
        }
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
        await saveLog(
          `Error updating organization by code: ${req.body.organizationCode}`,
          "Error",
          "deleteOrganization()",
          "Organization/{organizationCode?}"
        );

        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating organization by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating organization by code: ${req.body.organizationCode}, error ${error.message}`,
        "Error",
        "deleteOrganization()",
        "Organization/{organizationCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating organization by code",
        },
      };
    }
  };

  const deleteOrganizationFolder = async () => {
    delete req.body._id;
    try {
      const db = await database;
      const Organizations = db.collection("organization");
      const resp = Organizations.updateOne(
        { organizationCode: req.params.organizationCode },
        {
          $pull:
          {
            "repository.repositoryFolders": { folderCode: req.query.folderCode }
          }
        }
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
        await saveLog(
          `Error updating organization by code: ${req.body.organizationCode}`,
          "Error",
          "deleteOrganizationFolder()",
          "Organization/{organizationCode?}"
        );

        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error updating organization by code",
          },
        };
      }
    } catch (error) {
      await saveLog(
        `Error updating organization by code: ${req.body.organizationCode}, error ${error.message}`,
        "Error",
        "deleteOrganizationFolder()",
        "Organization/{organizationCode?}"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating organization by code",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      if (req.query.postOrganizationFolder) {
        await postOrganizationFolder()
        break;
      } else if (req.query.deleteOrganizationFolder) {
        await deleteOrganizationFolder()
        break;
      } else {
        await createOrganization();
        break;
      }
      break;
    case "PUT":
      await updateOrganization(req.params.organizationCode);
      break;
    case "GET":
      if (req.params.organizationCode) {
        await getOrganization(req.params.organizationCode);
      } else {
        await getOrganizations();
      }
      break;
    case "DELETE":
      await deleteOrganization(req.params.organizationCode);
      break;

    default:
      break;
  }
};

export default httpTrigger;
