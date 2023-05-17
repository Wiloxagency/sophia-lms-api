import { Configuration, OpenAIApi } from 'openai'
import {
    contentGeneration
    /*     ,
        introductionGeneration,
        conclusionsGeneration */
} from "./prompts";
import { paragraphCreation } from "../interfaces/paragraph";
import { saveLog } from '../shared/saveLog';

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

    console.info("createParagraphs/payload-->", payload)
    const languageName = payload.languageName
    let context = payload.context.replace(/curso de/gi, "").replace(/curso/gi, "").trim()
    const key = payload.key.replace(/curso de/gi, "").replace(/curso/gi, "").trim()
    const text: string = payload.text.replace(/curso de/gi, "").replace(/curso/gi, "").trim()
    const index = payload.index

    // const courseStructure = payload.courseStructure.map((tableItem: string, idx: number) => {
    //     return `${tableItem.trim()}\n`
    // }).join("\n")

    const promptCourseStructure = payload.courseStructure.map((tableItem: string, idx: number) => {
        return `Item ${idx + 1}: ${tableItem.trim()}\n`
    }).join("\n")

    const numSection = payload.courseStructure.map((item: string) => { return item.trim() }).indexOf(payload.text.trim())

    const notInclude = payload.courseStructure.
        filter((tableItem: string, idx: number) => {
            return idx != numSection
        }).
        map((tableItem: string, idx: number) => {
            return `Do not include: ${tableItem.trim()}\n`
        }).join("\n")

    const maxParagraphs = payload.maxParagraphs
    if (context.length < 3) {
        context = text
    }
    const openai = new OpenAIApi(configuration)
    //let prompt = ""

    let formattedText = text.replace(/\.+$/, "")

    // if (introductionGeneration[payload.language]["matches"].includes(formattedText.toLowerCase())) {
    //     prompt = introductionGeneration[payload.language]["prompt"].
    //         replace(/v{context}/g, context)
    // } else if (conclusionsGeneration[payload.language]["matches"].includes(formattedText.toLowerCase())) {
    //     prompt = conclusionsGeneration[payload.language]["prompt"].
    //         replace(/v{context}/g, context)
    // } else {
    // let age = ""
    // if (payload.options && payload.options != null) {
    //     age = contentGeneration[payload.language]["age"].
    //         replace(/v{courseLevel}/g, payload.options.courseLevel).
    //         replace(/v{fromAge}/g, payload.options.fromAge).
    //         replace(/v{toAge}/g, payload.options.toAge)
    // }
    console.info("v{context}-->", context)

    const prompt = contentGeneration.prompt.
        replace(/v{courseName}/g, context).
        replace(/v{languageName}/g, languageName).
        replace(/v{text}/g, formattedText)

    //}
    console.info("contentGeneration-->", prompt)

    try {
        // const response = await openai.createCompletion({
        //     model: "text-davinci-003",
        //     prompt: prompt,
        //     temperature: 1,
        //     max_tokens: 2500,
        //     top_p: 0.5,
        //     frequency_penalty: 0.71,
        //     presence_penalty: 0,
        // })
        // let data = response.data.choices[0].text.trim()

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: contentGeneration.role
                },
                {
                    role: "user",
                    content: prompt
                }
            ]

          })

        let data = response.data.choices[0].message.content.trim()

        const formattedData = formattedText + ": " + data.charAt(0).toUpperCase() + data.slice(1)
        const paragraphs = splitParagraphs(formattedData, true)

        return { "content": paragraphs, "sectionIndex": index }

    } catch (error) {
        await saveLog(`Error creating Paragraph for course: ${payload.courseCode}.`, "Error", "createParagraphs()", "Courses/{courseCode}/CreateContent")
        console.error(error)
        return { "content": null, "sectionIndex": index }
    }

}