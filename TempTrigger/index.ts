import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTranscriptionJob } from "../shared/azureSpeechToText";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    createTranscriptionJob(
        '65962c5b-58b1-4fee-a3d2-e0f1eecd8c92',
        0,
        0,
        0,
        'https://sophiafiles.blob.core.windows.net/speeches/f9d41f17-665e-4989-b3a9-c616a0c46c5b.mp3',
        'es-ES'
    )

}

export default httpTrigger;