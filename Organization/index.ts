import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection()

type EmbeddingType = {
  filename: string
  content: string
  code: string
  folderCode: string
  organizationCode: string
  fileTags?: string[]
}

type UserType = {
  repositoryTags: string[]
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const db = await database;

  const createOrganization = async () => {
    try {
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

  const UpdateOrganizationFolder = async () => {

    try {
      const Embeddings = db.collection<EmbeddingType>('embedding')
      const Organizations = db.collection('organization')

      if (req.query.addedTag != '') {
        // ADD TAG TO FOLDER AND TO ALL FOLDER FILES
        const folderTagsPath = `repository.repositoryFolders.$[element].folderTags`
        const addTagToFolder = await Organizations.updateOne(
          { organizationCode: req.params.organizationCode },
          {
            $push:
            {
              [folderTagsPath]: req.query.addedTag
            }
          },
          {
            arrayFilters: [
              {
                "element.folderCode": req.query.folderCode
              }
            ]
          }
        )
        const addTagToFolderFiles = await Embeddings.updateMany(
          { 'folderCode': req.query.folderCode },
          {
            $addToSet:
            {
              fileTags: req.query.addedTag
            }
          }
        )
      } else if (req.query.removedTag != '') {
        // REMOVE TAG FROM FOLDER AND ALL FOLDER FILES
        const folderTagsPath = `repository.repositoryFolders.$[element].folderTags`

        const removeTagFromFolder = await Organizations.updateOne(
          { organizationCode: req.params.organizationCode },
          {
            $pull:
            {
              [folderTagsPath]: req.query.removedTag
            }
          },
          {
            arrayFilters: [
              {
                "element.folderCode": req.query.folderCode
              }
            ]
          }
        )

        const removeTagFromFolderFiles = await Embeddings.updateMany(
          { 'folderCode': req.query.folderCode },
          {
            $pull:
            {
              fileTags: req.query.removedTag
            }
          }
        )
      } else {
        // UPDATE FOLDER NAME
        const folderNamePath = `repository.repositoryFolders.$[element].folderName`
        const removeTagFromFolder = await Organizations.updateOne(
          { organizationCode: req.params.organizationCode },
          {
            $set:
            {
              [folderNamePath]: req.body.folderName
            }
          },
          {
            arrayFilters: [
              {
                "element.folderCode": req.query.folderCode
              }
            ]
          }
        )
      }

      context.res = {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": { response: 'Executed' }
      }
    } catch (error) {
      await saveLog(`Error updating embedding document, error: ${error.message} `, "Error", "UpdateEmbeddingDocument()", "embeddings")
      context.res = {
        "status": 500,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Error updating embedding document"
        }
      }
    }
  }

  async function DeleteOrganizationTag() {
    try {
      const Organizations = db.collection('organization')
      const Embeddings = db.collection<EmbeddingType>('embedding')
      const Users = db.collection<UserType>('user')

      // // STEP 1: DELETE TAG FROM REPOSITORY
      const updateOrganization = await Organizations.updateOne(
        { organizationCode: req.params.organizationCode },
        {
          $pull:
          {
            "repository.repositoryTags": { tagName: req.query.removedTag }
          }
        }
      )

      // STEP 2: DELETE TAG FROM FOLDERS
      const removeTagFromFolder = await Organizations.updateOne(
        { organizationCode: req.params.organizationCode },
        {
          $pull:
          {
            "repository.repositoryFolders.$[].folderTags": req.query.removedTag
          }
        }
      )

      // STEP 3: DELETE TAG FROM FILES
      const updateFiles = await Embeddings.updateMany({},
        {
          $pull:
          {
            fileTags: req.query.removedTag
          }

        })

      // STEP 4: DELETE TAG FROM USERS
      const updateUsers = await Users.updateMany(
        { organizationCode: req.params.organizationCode },
        {
          $pull: {
            repositoryTags: req.query.removedTag
          }
        })

      context.res = {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": { response: 'Executed' }
      }
    } catch (error) {
      await saveLog(`Error deleting organization tag, error: ${error.message} `, "Error", "DeleteOrganizationTag()", "organization")
      context.res = {
        "status": 500,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "message": "Error deleting organization tag"
        }
      }
    }
  }

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
      if (req.query.updateOrganizationFolder) {
        await UpdateOrganizationFolder()
        break;
      } else if (req.query.deleteOrganizationTag) {
        await DeleteOrganizationTag()
        break;
      } else {
        await updateOrganization(req.params.organizationCode);
        break;
      }
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
