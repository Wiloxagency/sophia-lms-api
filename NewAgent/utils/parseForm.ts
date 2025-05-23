import parseMultipartFormData from "@anzp/azure-function-multipart";
import { HttpRequest } from "@azure/functions";

export async function parseForm(req: HttpRequest) {
  return await parseMultipartFormData(req);
}
