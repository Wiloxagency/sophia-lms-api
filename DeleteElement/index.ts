import { Context, HttpRequest } from "@azure/functions";
import { deleteAssets } from '../Course/deleteAssets';
import { BlobInfo } from './types';

export default async function (context: Context, req: HttpRequest): Promise<void> {
    const blobInfoList: BlobInfo[] = req.body;

    try {
        const result = await deleteAssets(blobInfoList);
        if (result) {
            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": "Successfully deleted files."
            }
        } else {
            context.res = {
                "status": 404,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": "Error deleting files"
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
