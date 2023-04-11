import { Context, HttpRequest } from "@azure/functions";
import { deleteAssets } from '../Course/deleteAssets';
import { BlobInfo } from './types';
import { saveLog } from "../shared/saveLog";

// TODO: Check this function declaration
export default async function (context: Context, req: HttpRequest): Promise<void> {
    const blobInfoList: BlobInfo[] = req.body;

    try {
        const result = await deleteAssets(blobInfoList);
        if (result) {
            context.res = {
                "status": 202,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": `Deleted files: ${result.count}`
            }
        }
    } catch (err) {
        await saveLog(`Error deleting asstes (blobInfoList[0].container, blobInfoList[0].file): ${blobInfoList[0].container, blobInfoList[0].file}, error: ${err.message} `, "Error", "AzureFunction()", "DeleteElement")
        context.res = {
            "status": 500,
            "body": "Internal server error"
        };
    }
};
