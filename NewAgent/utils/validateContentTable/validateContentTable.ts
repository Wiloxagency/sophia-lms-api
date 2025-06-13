// src/functions/validateContentTable.ts
import { Context, HttpRequest } from "@azure/functions";
import { validateContentWithOpenAI } from "./validationUtils";

export async function validateContentTable(context: Context, req: HttpRequest) {
  context.log("validateContentTable called");

  const result = await validateContentWithOpenAI(req.body, context);
  context.res = result;
}
