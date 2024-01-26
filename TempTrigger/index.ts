import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTranscriptionJob } from "../shared/azureSpeechToText";
import { returnLanguageAndLocaleFromLanguage } from "../shared/languages";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    // createTranscriptionJob(
    //     '65962c5b-58b1-4fee-a3d2-e0f1eecd8c92',
    //     0,
    //     0,
    //     0,
    //     'https://audio-lingua.ac-versailles.fr/IMG/mp3/frixuelos.mp3',
    //     'es-ES'
    // )

    // returnLanguageAndLocaleFromLanguage('es')

}

export default httpTrigger