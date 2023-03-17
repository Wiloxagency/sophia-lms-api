import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createClient } from 'pexels';

const client = createClient('mtCEdnRigTAFPj5nELvf5XSfjwfslcwz1qGfCf0gj1EZ57XCh3KraNns');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    console.log(req.body)
    const query = req.body.query
    console.log(query)
    let responseVideos = await client.videos.search({ query, per_page: 80, orientation: 'landscape' })

    context.res = {
        "status": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": { "response": responseVideos }
    }
}

export default httpTrigger;