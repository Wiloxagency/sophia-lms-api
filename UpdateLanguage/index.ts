import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { template } from "../Language/template";
const fs = require('fs');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const updateLanguage = async () => {
    const translateValues = require('../Language/index');

    const languages = ['es']; 

    const templateEn = JSON.parse(fs.readFileSync(template));
    console.log(templateEn)

    templateEn.hello = 'Hello, world! This is a test';

    for (const lang of languages) {
    const outputFile = `translated-values-${lang}.json`;
    const translations = JSON.parse(fs.readFileSync(outputFile));

    const translatedValue = await translateValues('Hello, world!', lang);
    translations.hello = translatedValue;

    fs.writeFileSync(outputFile, JSON.stringify(translations, null, 2));
    }
    }
    



    switch (req.method) {
        case "POST":
            await updateLanguage()
            break;


        default:
            break;
    }

}

export default httpTrigger;