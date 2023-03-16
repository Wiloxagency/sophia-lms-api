import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createClient } from 'pexels';

const client = createClient('mtCEdnRigTAFPj5nELvf5XSfjwfslcwz1qGfCf0gj1EZ57XCh3KraNns');
const query = 'Nature';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    let responseVideos = await client.videos.search({ query, per_page: 80 })

    context.res = {
        "status": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": { "test": responseVideos }
    }
}

export default httpTrigger;