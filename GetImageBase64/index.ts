import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import https from 'https';
import http from 'http';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        context.res = {
            status: 400,
            body: "Missing 'url' query parameter"
        };
        return;
    }

    const client = imageUrl.startsWith('https') ? https : http;

    try {
        const base64Data = await new Promise<string>((resolve, reject) => {
            client.get(imageUrl, (res) => {
                let data: Uint8Array[] = [];

                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(data);
                    const contentType = res.headers['content-type'] || 'image/jpeg';
                    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
                    resolve(base64);
                });
            }).on('error', reject);
        });

        context.res = {
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            },
            body: base64Data
        };
    } catch (error: any) {
        context.res = {
            status: 500,
            body: "Error fetching or converting image: " + error.message
        };
    }
};

export default httpTrigger;
