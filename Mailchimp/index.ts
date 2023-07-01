import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
    apiKey: "6e02af28f86bb15f870ef955a8fad4e5-us8",
    server: "us8",
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

    mailchimpPing()

};


async function mailchimpPing() {
    const response = await mailchimp.ping.get();
    console.log(response);
}



export default httpTrigger;