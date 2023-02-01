import { Configuration, OpenAIApi } from 'openai'
import {
    contentGeneration,
    introductionGeneration,
    conclusionsGeneration
} from "./gpt3.prompt";
import { paragraphCreation } from "../interfaces/paragraph";

// OpenAI Credentials
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});



function splitParagraphByThreshold(text: string): string[] {
    let out: string[] = []
    let threshold = 400
    let numItems = 0
    text.trim().split(".").forEach(chunk => {
        if (numItems > 0) {

            if (chunk.length + out[numItems - 1].length < threshold) {
                if (chunk.trim().length > 0) {
                    out[numItems - 1] += ' ' + chunk.trim() + '.'
                }
            } else {
                out.push(chunk.trim() + '.')
                numItems++
            }
        } else {
            out.push(chunk.trim() + '.')
            numItems++
        }
    })
    return out
}

function splitParagraphs(text: string, autoBreak: boolean): string[] {
    let validParagraphs = text.split("\n").filter(p => {
        return p.length >= 50
    })
    let paragraphs: string[] = []
    //console.info("autoBreak:", autoBreak)
    validParagraphs.forEach(validParagraph => {
        if (autoBreak) {
            splitParagraphByThreshold(validParagraph).forEach(p => {
                paragraphs.push(p.replace(/\n/g, ""))
            })
        } else {
            paragraphs.push(validParagraph.replace(/\n/g, ""))
        }
    })
    return paragraphs
}

export async function createParagraphs(payload: paragraphCreation): Promise<{ content: string[]; sectionIndex: number; }> {

    let context = payload.context.replace(/curso de/gi, "").replace(/curso/gi, "").trim()
    const key = payload.key.replace(/curso de/gi, "").replace(/curso/gi, "").trim()
    const text: string = payload.text.replace(/curso de/gi, "").replace(/curso/gi, "").trim()
    const index = payload.index
    console.info("payload.courseStructure: ", payload.courseStructure)
    const courseStructure = payload.courseStructure.map((tableItem: string, idx: number) => {
        return `${tableItem.trim()}\n`
    }).join("\n")

    const numSection = payload.courseStructure.map((item: string) => { return item.trim() }).indexOf(payload.text.trim())
    //console.info("payload.courseStructure, payload.text, numSection -->", payload.courseStructure, payload.text, numSection)

    const notInclude = payload.courseStructure.
        filter((tableItem: string, idx: number) => {
            return idx != numSection
        }).
        map((tableItem: string, idx: number) => {
            return `${contentGeneration[payload.language]["notInclude"]} información relacionada con: ${tableItem.trim()}\n`
        }).join("\n")

    const maxParagraphs = payload.maxParagraphs
    if (context.length < 3) {
        context = text
    }
    const openai = new OpenAIApi(configuration);
    let prompt = ""

    let formattedText = text.replace(/\.+$/, "");

    // console.info("formattedText.toLowerCase -->", formattedText.toLowerCase())
    // console.info(introductionGeneration[payload.language]["matches"])
    // console.info(conclusionsGeneration[payload.language]["matches"])

    if (introductionGeneration[payload.language]["matches"].includes(formattedText.toLowerCase())) {
        prompt = introductionGeneration[payload.language]["prompt"].
            replace(/v{context}/g, context)
    } else if (conclusionsGeneration[payload.language]["matches"].includes(formattedText.toLowerCase())) {
        prompt = conclusionsGeneration[payload.language]["prompt"].
            replace(/v{context}/g, context)
    } else {
        let age = ""
        if (payload.options && payload.options != null) {
            age = contentGeneration[payload.language]["age"].
                replace(/v{courseLevel}/g, payload.options.courseLevel).
                replace(/v{fromAge}/g, payload.options.fromAge).
                replace(/v{toAge}/g, payload.options.toAge)
        }
        prompt = contentGeneration[payload.language]["prompt"].
            replace(/v{context}/g, context).
            replace(/v{courseStructure}/g, courseStructure).
            replace(/v{numSection}/g, numSection + 1).
            replace(/v{text}/g, formattedText).
            replace(/v{age}/g, age).
            replace(/v{notInclude}/g, notInclude)
    }


    console.info("Prompt --->", prompt)
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 1,
        max_tokens: 2500,
        top_p: 0.5,
        frequency_penalty: 0.71,
        presence_penalty: 0,
    })
    let data = response.data.choices[0].text.trim()
    //console.info("data --->", data)


    const formattedData = formattedText + ": " + data.charAt(0).toUpperCase() + data.slice(1)
    const paragraphs = splitParagraphs(formattedData, true)
    //console.info("paragraphs --->", paragraphs)
    return { "content": paragraphs, "sectionIndex": index }
}