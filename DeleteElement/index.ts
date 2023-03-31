import { Context, HttpRequest } from "@azure/functions"
import deleteAssets from '../Course'
import {BlobInfo} from './types'

export default async function (context: Context, req: HttpRequest): Promise<void> {
const blobInfoList: BlobInfo[] = req.body;

  try {
  await deleteAssets(context, req, blobInfoList);
  if (deleteAssets) {

    context.res = {
        "status": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": "Successfully deleted files."
    }
} else {
    context.res = {
        "status": 204,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": {
            "message": "Error deleting files"
        }
    }

}} catch (err) {
    return
    };

};
             