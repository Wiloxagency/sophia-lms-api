import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {

        var axios = require('axios');

        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.freepik.com/v1/resources?locale=en-GB&page=1&limit=21&order=priority&term=' + req.body.query + '?content_type=photo',
            headers: {
                'Accept-Language': 'en-GB',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Freepik-API-Key': 'HFeyH3zlyHD7xOvAJp1ke3IJcXwR95E07tBjGNDZmkEoUvhq'
            }
        };

        let imagesResponse

        let test = await axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data))
                imagesResponse = response.data
            })
            .catch(function (error) {
                console.log(error);
            });

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: { response: imagesResponse }
        }

    } catch (error) {
        await saveLog(`Error using Freepik API, error: ${error.message} `, "Error", "AzureFunction()", "Freepik")
    }


}

export default httpTrigger;