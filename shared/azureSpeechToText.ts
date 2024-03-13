import { createConnection } from "../shared/mongo";
const axios = require("axios").default;

const database = createConnection();

export async function createTranscriptionJob(
  courseCode: string,
  indexSection: number,
  indexElement: number,
  indexParagraph: number,
  audioUrl: string,
  locale: string
) {
  let requestBody = JSON.stringify({
    contentUrls: [audioUrl],
    properties: {
      wordLevelTimestampsEnabled: true,
      displayFormWordLevelTimestampsEnabled: true,
    },
    locale: locale,
    displayName: "Single paragraph transcription",
    customProperties: {
      courseCode: courseCode,
      indexSection: indexSection,
      indexElement: indexElement,
      indexParagraph: indexParagraph,
    },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://eastus2.api.cognitive.microsoft.com/speechtotext/v3.1/transcriptions",
    headers: {
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": "205669de4511412299e6684bb83e5eb1",
    },
    data: requestBody,
  };

  axios
    .request(config)
    .then((response) => {
      // checkTranscriptionJobStatus(response.data.self)
      updateSlideAfterTranscriptionJob(
        courseCode,
        indexSection,
        indexElement,
        indexParagraph,
        response.data.self,
        "running"
      );
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function updateSlideAfterTranscriptionJob(
  courseCode: string,
  indexSection: number,
  indexElement: number,
  indexParagraph: number,
  transcriptionJobUrl: string,
  transcriptionJobStatus: string,
  transcriptionResult?: {
    display: string;
    displayWords: {
      displayText: string;
      offsetInTicks: number;
      durationInTicks: number;
    }[];
  }
) {
  try {
    const db = await database;
    const Courses = db.collection("course");

    const slidePath = `sections.${indexSection}.elements.${indexElement}.elementLesson.paragraphs.${indexParagraph}.srt`;

    const transcriptionJobUrlPath = slidePath + ".transcriptionJobUrl";
    const transcriptionJobStatusPath = slidePath + ".transcriptionJobStatus";

    const transcriptionResultPath = slidePath + ".transcriptionResult";

    const updateSlideResponse = await Courses.updateOne(
      { code: courseCode },
      {
        $set: {
          [transcriptionJobUrlPath]: transcriptionJobUrl,
          [transcriptionJobStatusPath]: transcriptionJobStatus,
          [transcriptionResultPath]: transcriptionResult,
        },
      }
    );

    console.log("TRANSCRIPTION RESULTS: ");
    console.log(
      transcriptionJobUrl,
      transcriptionJobStatus,
      transcriptionResult
    );
    console.log(updateSlideResponse);
  } catch (error) {
    console.error(error);
  }
}
