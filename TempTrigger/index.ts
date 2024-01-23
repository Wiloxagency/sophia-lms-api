import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTranscriptionJob } from "../shared/azureSpeechToText";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    createTranscriptionJob(
        '65962c5b-58b1-4fee-a3d2-e0f1eecd8c92',
        0,
        0,
        0,
        'https://sophiafiles.blob.core.windows.net/speeches/5a5472a3-ca10-4436-a342-9631d0fa65ed.mp3'
    )

}

export default httpTrigger;