import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createAudio } from "../CreateContent/createAudios";
import { createkeyphrases } from "../CreateContent/createKeyphrases";
// import { createParagraphs } from "../CreateContent/createParagrahs";
import { findImages } from "../CreateContent/findImages";
import { extractTitle } from "../CreateContent/titleExtraction";
import { paragraphCreation } from "../interfaces/paragraph";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { v4 as uuidv4 } from "uuid";
import { updateCourseDuration } from "../shared/updateCourseDuration";
import { returnPexelsImages } from "../PexelsImages/shared";
import { translateToLanguage } from "../shared/translator";
import { createTranscriptionJob } from "../shared/azureSpeechToText";
import { returnLanguageAndLocaleFromLanguage } from "../shared/languages";
// import { fetchAndParsePexelsImagesAndVideosAndReturnOne } from "../CreateContent/cycle";
import { updateUserCreditConsumption } from "../shared/creditConsumption";
import { asyncCreateParagraphs } from "../CreateContent/asyncCreateParagrahs";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const db = await database;
  const Courses = db.collection("course");

  console.info(req.body)
  let totalParagraphsCounter = 0;
  let currentImageCounter = 0;
  let currentVideoCounter = 0;

  const payload: paragraphCreation = {
    context: req.body.courseTitle,
    key: "",
    text: req.body.lessonTitle,
    index: 0,
    maxParagraphs: 15,
    courseStructure: req.body.syllabus,
    language: req.body.language,
    languageName: req.body.languageName,
    courseCode: req.body.courseCode,
    voice: req.body.voice,
  };

  const lesson = {
    type: "Lección Engine",
    title: "Presentation",
    elementCode: uuidv4(),
    elementLesson: {
      lessonTheme: "1",
      paragraphs: [],
    },
  };

  const sectionPath = `sections.${req.body.indexSection}.elements`;

  try {
    await Courses.updateOne(
      { code: req.body.courseCode },
      {
        $push: { [sectionPath]: lesson },
      }
    );
  } catch (error) {
    await saveLog(
      `Error updating a course ${req.body.courseCode} in lesson creation for indexSection: ${req.body.indexSection}`,
      "Error",
      "AzureFunction()",
      "Courses/{courseCode}/CreateLesson"
    );
    throw new Error(error.message);
  }

  const updatedCourse = await Courses.findOne({ code: req.body.courseCode });

  const elementIndex =
    updatedCourse.sections[req.body.indexSection].elements.length - 1;

  const syllabus = updatedCourse.sections.map( (section: any) => {
    return section.title
  })
  // TODO -> Refactor to Async mode
 const currentParagraphs = await asyncCreateParagraphs(
  req.body.courseCode,
  req.body.courseTitle,
  syllabus,
  req.body.languageName,
  updatedCourse.language,
  syllabus[req.body.indexSection],
  req.body.indexSection,
  req.body.indexLesson,
  req.body.lessonTitle
 );
  // const currentParagraphs = {content: []};



  let remainingCredits = null;

  remainingCredits = await updateUserCreditConsumption(req.body.userCode, "cl");

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      currentParagraphs: currentParagraphs,
      remainingCredits: remainingCredits,
    },
  };
};

export default httpTrigger;
