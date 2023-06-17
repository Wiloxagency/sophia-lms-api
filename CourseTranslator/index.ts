import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveLog } from "../shared/saveLog"
import axios, { AxiosResponse } from 'axios'

// const COURSE_TRANSLATOR_SUBSCRIPTION_KEY = process.env.COURSE_TRANSLATOR_SUBSCRIPTION_KEY
const COURSE_TRANSLATOR_SUBSCRIPTION_KEY = '569573b0d7c9412887eaef823b637e01'

const requestConfiguration = {
    // EduFactory
    headers: {
        'Ocp-Apim-Subscription-Key': COURSE_TRANSLATOR_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Region': 'eastus2',
        'charset': 'UTF-8'
    }
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    let tempBody = [
        {
            "Text": "Hallo. Bist du fertig?"
        }
    ]

    let params = {
        'api-version': '3.0',
        'to': ['sw', 'it']
    }

    try {

        // curl -X POST "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans"
        // -H "Ocp-Apim-Subscription-Key: <client-secret>" -H "Content-Type: application/json; charset=UTF-8"
        // -d "[{'Text':'Hello, what is your name?'}]"

        const body = await axios.post(
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=es',
            tempBody,
            requestConfiguration
        )
            .then(async result => { return result })

        console.log(body)
        if (body) {

            context.res = {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": body.data
            }
        }
    }
    catch (error) {
        await saveLog(`Error translating course. ` + error.message, "Error", "CourseTranslator", "CourseTranslator")
    }

}

export default httpTrigger;