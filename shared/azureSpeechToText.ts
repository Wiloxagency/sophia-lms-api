import { createConnection } from "../shared/mongo"
const axios = require('axios').default

const database = createConnection()

export async function createTranscriptionJob(
    courseCode: string,
    indexSection: number,
    indexElement: number,
    indexSlide: number,
    audioUrl: string
) {

    updateSlide(
        courseCode,
        indexSection,
        indexElement,
        indexSlide,
        'https://eastus2.api.cognitive.microsoft.com/speechtotext/v3.1/transcriptions/079680c4-04c1-4e40-80f5-809eea1112fd',
        'created'
    )

    return

    audioUrl = "https://sophieassets.blob.core.windows.net/speeches/7eb2d468-5a3d-4bb9-a2d2-cd5b461749da.mp3"

    let requestBody = JSON.stringify({
        "contentUrls": [audioUrl],
        "properties": {
            "wordLevelTimestampsEnabled": true,
            "displayFormWordLevelTimestampsEnabled": true
        },
        "locale": "es-ES",
        "displayName": "Test"
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://eastus2.api.cognitive.microsoft.com/speechtotext/v3.1/transcriptions',
        headers: {
            'content-type': 'application/json',
            'Ocp-Apim-Subscription-Key': '205669de4511412299e6684bb83e5eb1'
        },
        data: requestBody
    };

    axios.request(config)
        .then((response) => {
            // checkTranscriptionJobStatus(response.data.self)
            updateSlide(
                courseCode,
                indexSection,
                indexElement,
                indexSlide,
                response.data.self,
                'created'
            )
        })
        .catch((error) => {
            console.log(error)
        });
}

async function updateSlide(
    courseCode: string,
    indexSection: number,
    indexElement: number,
    indexSlide: number,
    transcriptionJobUrl: string,
    transcriptionJobStatus: string,
) {
    try {
        const db = await database
        const Courses = db.collection('course')

        const slidePath = `sections.${indexSection}.elements.${indexElement}.elementLesson.paragraphs.${indexSlide}`

        const transcriptionJobUrlPath = slidePath + '.transcriptionJobUrl'
        const transcriptionJobStatusPath = slidePath + '.transcriptionJobStatus'
        // const course = await Courses.findOne({ code: courseCode })
        // console.log(course)

        const updateSlideResponse = await Courses.updateOne(
            { code: courseCode },
            {
                $set: {
                    [transcriptionJobUrlPath]: transcriptionJobUrl,
                    [transcriptionJobStatusPath]: transcriptionJobStatus
                }
            })

        console.log(updateSlideResponse)
    } catch (error) {
        console.error(error)
    }

}