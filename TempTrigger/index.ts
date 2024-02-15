import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createTranscriptionJob } from "../shared/azureSpeechToText";
import { returnLanguageAndLocaleFromLanguage } from "../shared/languages";
import {
  findImagesFromAssets,
  returnInitialImages,
} from "../CreateContent/findImages";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const paragraphTitle = "Estrategias básicas";
  const courseTitle = "Pasos concretos para mejorar la productividad laboral";

  //   const findImageResponse = await findImageFromAssets(
  //     paragraphTitle,
  //     courseTitle
  //   );

  const returnInitialImagesResponse = await returnInitialImages();

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: returnInitialImagesResponse,
  };
  //   console.log(findImageResponse);

  // createTranscriptionJob(
  //     '65962c5b-58b1-4fee-a3d2-e0f1eecd8c92',
  //     0,
  //     0,
  //     0,
  //     'https://audio-lingua.ac-versailles.fr/IMG/mp3/frixuelos.mp3',
  //     'es-ES'
  // )

  // returnLanguageAndLocaleFromLanguage('es')
};

export default httpTrigger;
