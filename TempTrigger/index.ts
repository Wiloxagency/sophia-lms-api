import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createDallePrompt } from "../CreateContent/createDallePrompt";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  console.log(req.body);
  const prompt = await createDallePrompt(
    req.body.courseName,
    req.body.courseCode, 
    req.body.paragraph, 
    req.body.sectionIndex, 
    req.body.elementIndex, 
    req.body.slideIndex)
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: {"prompt": prompt},
  };
};

export default httpTrigger;
