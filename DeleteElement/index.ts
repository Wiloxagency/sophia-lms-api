import { Context, HttpRequest } from "@azure/functions";
import { deleteAssets } from '../Course/deleteAssets';
import { BlobInfo } from './types';

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
        console.error(err);
        context.res = {
            "status": 500,
            "body": "Internal server error"
        };
    }
};
