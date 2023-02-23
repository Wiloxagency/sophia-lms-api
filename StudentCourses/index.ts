import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const getCourses = async () => {

    }

    switch (req.method) {

        case "GET":

            await getCourses()


            break;

        default:
            break;
    }


}

export default httpTrigger;