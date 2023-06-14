import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { downloadTextElementAsDoc } from "./download";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  switch (req.method) {
    case "POST":
      if (req.query.operation == "download") {
        const response = await downloadTextElementAsDoc(
          req.query.courseCode,
          req.query.indexSection,
          req.query.indexElement
        );
        if (response) {
          context.res = {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
            body: { url: response },
          };
        } else {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error",
            },
          };
        }
      }

      break;

    default:
      break;
  }
};

export default httpTrigger;
