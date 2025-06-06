import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { handleCreateContentTable } from "./handlers/createContentTable";
import { handleCreateCourse } from "./handlers/createCourse";
import { validateContentTable } from "./utils/validateContentTable";

const httpTrigger: AzureFunction = async function (context, req) {
  try {
    const task = req.query.task;

    if (!task) {
      context.res = {
        status: 400,
        body: { error: "Missing query parameter: task" },
      };
      return;
    }

    switch (task) {
      case "createContentTable":
        await handleCreateContentTable(context, req);
        break;
      case "createCourse":
        await handleCreateCourse(context, req);
        break;
      case "validateContentTable":
        await validateContentTable(context, req);
        break;
      default:
        context.res = {
          status: 400,
          body: { error: `Unknown task: ${task}` },
        };
    }
  } catch (err: any) {
    context.log.error("Error in function:", err);
    context.res = {
      status: 500,
      body: { error: "Internal Server Error", details: err.message },
    };
  }
};

export default httpTrigger;
