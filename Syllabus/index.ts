import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createContentTable } from "../CreateContent/createContentTable";
import { saveLog } from "../shared/saveLog";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        const contentTable = await createContentTable(req.body.text, req.body.maxSections, req.body.language, "N/A", req.body.courseDescription)
        context.res = {
            "status": 201,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": contentTable
        }
    } catch (error) {
        await saveLog(`Error creating syllabus, error ${error.message}`, "Error", "AzureFunction()", "Syllabus")

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