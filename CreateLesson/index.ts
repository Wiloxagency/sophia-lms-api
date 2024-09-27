import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createAudio } from "../CreateContent/createAudios";
import { createkeyphrases } from "../CreateContent/createKeyphrases";
import { createParagraphs } from "../CreateContent/createParagrahs";
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
import { fetchAndParsePexelsImagesAndVideosAndReturnOne } from "../CreateContent/cycle";
import { updateUserCreditConsumption } from "../shared/creditConsumption";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const isSelfManageable = req.body.isSelfManageable;
  const db = await database;
  const Courses = db.collection("course");

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

  const currentParagraphs = await createParagraphs(payload);

  let pexelsImagesResponse;
  let parsedPexelImages = [];

  pexelsImagesResponse = await returnPexelsImages(req.body.courseTitle);
  parsedPexelImages = pexelsImagesResponse.photos.map((photo) => {
    return photo.src.large;
  });

  // Create Audios & find images
  const multimediaCycle = async (paragraphCounter: number) => {
    console.log("STARTED MEDIA CYCLE FOR PARAGRAPH ", paragraphCounter + 1);

    let currentParagraphPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}`;
    let currentParagraphContentPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.content`;
    let currentParagraphAudioScriptPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.audioScript`;
    let currentParagraphAudioUrlPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.audioUrl`;
    let currentParagraphTitleAIPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.titleAI`;
    let currentParagraphTranslatedTitleAIPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.translatedTitleAI`;
    let currentParagraphImageDataPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.imageData`;
    let currentParagraphVideoDataPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.videoData`;
    let currentParagraphKeyPhrasesPath = `sections.${req.body.indexSection}.elements.${req.body.indexLesson}.elementLesson.paragraphs.${paragraphCounter}.keyPhrases`;

    const paragraphContent = currentParagraphs.content[paragraphCounter];

    let currentParagrah = {
      content: paragraphContent,
      audioScript: paragraphContent,
      audioUrl: "",
      titleAI: "",
      translatedTitleAi: "",
      imageData: {},
      keyPhrases: [],
    };

    await Courses.findOneAndUpdate(
      { code: req.body.courseCode },
      {
        $set: {
          [currentParagraphContentPath]: paragraphContent,
          [currentParagraphAudioScriptPath]: paragraphContent,
        },
      }
    );

    const sectionIndex = req.body.indexSection;
    const currentAudio = await createAudio(
      paragraphContent,
      payload.voice,
      payload.language,
      req.body.courseCode,
      sectionIndex,
      req.body.indexLesson,
      paragraphCounter
    );
    // console.info(
    //   `Audio for section ${sectionIndex}}, paragraph ${paragraphCounter + 1}/${
    //     currentParagraphs.content.length
    //   } created`
    // );
    currentParagrah.audioUrl = currentAudio.url;

    await Courses.findOneAndUpdate(
      { code: req.body.courseCode },
      {
        $set: {
          [currentParagraphAudioUrlPath]: currentAudio.url,
        },
      }
    );

    const extractedTitle = await extractTitle(
      paragraphContent,
      payload.text,
      "es",
      req.body.courseTitle,
      req.body.courseCode
    );
    // console.info(
    //   `Title for section ${sectionIndex}, paragraph ${paragraphCounter + 1}/${
    //     currentParagraphs.content.length
    //   } Extracted `
    // );

    currentParagrah.titleAI = extractedTitle.title;

    const translatedTitleAi = await translateToLanguage(
      extractedTitle.title,
      payload.language
    );

    const noQuotesTranslatedTitleAi = translatedTitleAi.replace(/['"]+/g, "");
    const noQuotesTitleAi = extractedTitle.title.replace(/['"]+/g, "");

    currentParagrah.translatedTitleAi = translatedTitleAi;

    await Courses.findOneAndUpdate(
      { code: req.body.courseCode },
      {
        $set: {
          [currentParagraphTitleAIPath]: noQuotesTitleAi,
          [currentParagraphTranslatedTitleAIPath]: noQuotesTranslatedTitleAi,
        },
      }
    );

    // 👇🏻ADD IMAGE/VIDEO TO SLIDE 🖼️📽️

    if (!(totalParagraphsCounter % 2 == 0)) {
      // IS IMAGE 🖼️
      const currentImageData =
        await fetchAndParsePexelsImagesAndVideosAndReturnOne(
          req.body.courseTitle,
          totalParagraphsCounter,
          currentImageCounter,
          -1
        );

      currentImageCounter++;

      // CREATE EMPTY VIDEO STRUCTURE
      currentParagrah["videoData"] = {
        thumb: { url: "", width: 0, height: 0 },
        finalVideo: { url: "", width: 0, height: 0 },
      };

      // console.info(
      //   `Image for section ${sectionCounter + 1}/${
      //     course.sections.length
      //   }, Lesson ${lessonCounter + 1}, paragraph ${
      //     paragraphCounter + 1
      //   }/${currentParagraphs.content.length} created`
      // );
      currentParagrah["imageData"] = currentImageData;

      await Courses.findOneAndUpdate(
        { code: req.body.courseCode },
        {
          $set: {
            [currentParagraphImageDataPath]: currentImageData,
            [currentParagraphVideoDataPath]: currentParagrah["videoData"],
          },
        }
      );
    } else {
      // IS VIDEO 📽️
      const currentVideoData =
        await fetchAndParsePexelsImagesAndVideosAndReturnOne(
          req.body.courseTitle,
          totalParagraphsCounter,
          -1,
          currentVideoCounter
        );

      currentVideoCounter++;

      // CREATE EMPTY IMAGE STRUCTURE
      currentParagrah["imageData"] = {
        image: {},
        thumb: {},
        finalImage: {},
        imagesIds: "",
        urlBing: "",
      };

      // console.info(
      //   `Video for section ${sectionCounter + 1}/${
      //     course.sections.length
      //   }, Lesson ${lessonCounter + 1}, paragraph ${
      //     paragraphCounter + 1
      //   }/${currentParagraphs.content.length} created`
      // );
      currentParagrah["videoData"] = currentVideoData;

      await Courses.findOneAndUpdate(
        { code: req.body.courseCode },
        {
          $set: {
            [currentParagraphVideoDataPath]: currentVideoData,
            [currentParagraphImageDataPath]: currentParagrah["imageData"],
          },
        }
      );
    }

    // const currentImageData = {
    //   image: {},
    //   thumb: {},
    //   finalImage: {
    //     url: parsedPexelImages[paragraphCounter],
    //     width: "",
    //     height: "",
    //   },
    //   imagesIds: [],
    //   urlBing: "",
    // };
    // await Courses.findOneAndUpdate(
    //   { code: req.body.courseCode },
    //   {
    //     $set: {
    //       [currentParagraphImageDataPath]: currentImageData,
    //       [currentParagraphVideoDataPath]: currentParagrah["videoData"],
    //     },
    //   }
    // );

    // currentParagrah.imageData = currentImageData;

    const keyPhrases = await createkeyphrases(
      paragraphContent,
      "es",
      req.body.courseCode
    );
    currentParagrah.keyPhrases = keyPhrases;

    await Courses.findOneAndUpdate(
      { code: req.body.courseCode },
      {
        $set: {
          [currentParagraphKeyPhrasesPath]: keyPhrases,
        },
      }
    );

    // console.info(
    //   `KeyPhrases for section ${sectionIndex}, paragraph ${
    //     paragraphCounter + 1
    //   }/${currentParagraphs.content.length} created`
    // );

    //create an empty video structure too
    currentParagrah["videoData"] = {
      thumb: { url: "", width: 0, height: 0 },
      finalVideo: { url: "", width: 0, height: 0 },
    };

    // console.log(
    //   req.body.courseCode,
    //   currentAudio.sectionIndex,
    //   req.body.indexLesson,
    //   currentAudio.paragraphIndex,
    //   currentAudio.url,
    //   await returnLanguageAndLocaleFromLanguage(req.body.language)
    // );

    const azureSpeechToText = await createTranscriptionJob(
      req.body.courseCode,
      currentAudio.sectionIndex,
      req.body.indexLesson,
      currentAudio.paragraphIndex,
      currentAudio.url,
      await returnLanguageAndLocaleFromLanguage(req.body.language)
    );

    lesson.elementLesson.paragraphs.push(currentParagrah);

    paragraphCounter++;
    totalParagraphsCounter++;

    if (paragraphCounter == currentParagraphs.content.length) {
      await saveLog(
        `Completed course lesson creation for: ${req.body.courseCode}`,
        "Info",
        "multimediaCycle()",
        "Courses/{courseCode}/CreateLesson"
      );

      // Save course (in the future be necessary to check if content was 100% fine generated)
      const newSectionPath = `sections.${req.body.indexSection}.elements.${elementIndex}`;
      try {
        // await Course.updateOne(
        //   { code: req.body.courseCode },
        //   {
        //     $set: { [newSectionPath]: lesson },
        //   }
        // );
        updateCourseDuration(req.body.courseCode);
      } catch (error) {
        await saveLog(
          `Error updating a course ${req.body.courseCode} in lesson creation for indexSection: ${req.body.indexSection}`,
          "Error",
          "AzureFunction()",
          "Courses/{courseCode}/CreateLesson"
        );
      }
    } else {
      await multimediaCycle(paragraphCounter);
    }
  };
  multimediaCycle(0);

  let remainingCredits = null;
  if (isSelfManageable) {
    remainingCredits = await updateUserCreditConsumption(
      req.body.userCode,
      "cl"
    );
  }

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
