import { saveLog } from "./saveLog";

// import axios, { AxiosResponse } from 'axios' 
const axios = require('axios').default
const { v4: uuidv4 } = require('uuid')

//TODO: put this key outside this file
let key = "41589751e1a24680ab0e464d492e4559"
let endpoint = "https://api.cognitive.microsofttranslator.com"

// location, also known as region.
// required if you're using a multi-service or regional (not global) resource. It can be found in the Azure portal on the Keys and Endpoint page.
let location = "eastus2";

export async function translateQuery(receivedQuery: string): Promise<any> {

    let payloadX = {
        baseURL: endpoint,
        url: '/translate',
        method: 'post',
        headers: {
            'Ocp-Apim-Subscription-Key': key,
            // location required if you're using a multi-service or regional (not global) resource.
            'Ocp-Apim-Subscription-Region': location,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString()
        },
        params: {
            'api-version': '3.0',
            'to': ['en']
        },
        data: [{
            'text': receivedQuery
        }],
        responseType: 'json'
    }

    let payload = {
        baseURL: endpoint,
        url: '/translate',
        method: 'post',
        headers: {
            'Ocp-Apim-Subscription-Key': key,
             // location required if you're using a multi-service or regional (not global) resource.
            'Ocp-Apim-Subscription-Region': location,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString(),
        },
        params: {
            'api-version': '3.0',
            'from': 'en',
            'to': ['fr', 'zu']
        },
        data: [{
            'text': 'The human brain'
        }],
        responseType: 'json'
    }


    console.info(payload)

    try {

        const axiosResponse = await axios(payload)

        // console.log(
        //     JSON.stringify(axiosResponse.data, null, 4)
        // )

        let translatedQuery = axiosResponse.data[0].translations[0].text
        // console.log(translatedQuery)
        return translatedQuery

        // let translatedQuery

        // .then(function (response) {
        //     // console.log(JSON.stringify(response.data, null, 4))
        //     // console.log(JSON.stringify(response.data[0].translations[0].text))
        //     let translatedQuery = JSON.stringify(response.data[0].translations[0].text)
        //     console.log(translatedQuery)
        //     return { translatedQuery }
        // })

    } catch (error) {
        await saveLog(`Error traslating a query, error ${error.message}`, "Error", "translateQuery()", "N/A")

        return { error }
    }

}