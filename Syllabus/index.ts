import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createContentTable } from "../CreateContent/createContentTable";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        const contentTable = await createContentTable(req.body.text, req.body.maxSections, req.body.language, "N/A")
        context.res = {
            "status": 201,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": contentTable
        }
    } catch (error) {
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error creating syllabus"
            }
        }
    }

};

export default httpTrigger;