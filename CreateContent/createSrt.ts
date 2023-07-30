import axios from 'axios'
import { saveLog } from '../shared/saveLog'

const urlSrt = "https://srt.aifluency.app/srt"
const configSrt = {
    // EduFactory
    headers: {
        'Content-Type': 'application/json'
    }
}

export async function createSrt(audioUrl: string, textForSubtitles: string, courseCode: string) {
    try {
        return await axios.post(urlSrt,{audio_url: audioUrl, text_for_subtitles: textForSubtitles}, configSrt).then(async result => { return result.data })
    } catch (error) {

        await saveLog(`Error creating srt for course: ${courseCode}.`, "Error", "searchBingImages()", "Courses/{courseCode}/CreateContent")

        return [{ data: [] }]
    }

}