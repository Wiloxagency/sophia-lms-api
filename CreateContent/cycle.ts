import { createAudio } from "./createAudios";
import { createConnection } from "../shared/mongo";
import { createParagraphs } from "./createParagrahs";
import { findImages, findImagesFromAssets } from "./findImages";
import { paragraphCreation } from "../interfaces/paragraph";
import {
  deleteCourseCreationLog,
  saveCourseCreationLog,
  saveLog,
} from "../shared/saveLog";
import { extractTitle } from "./titleExtraction";
import { createkeyphrases } from "./createKeyphrases";
import { createSrt } from "./createSrt";
import { updateCourseDuration } from "../shared/updateCourseDuration";
import { createTranscriptionJob } from "../shared/azureSpeechToText";
import { returnLanguageAndLocaleFromLanguage } from "../shared/languages";
import { returnPexelsImages } from "../PexelsImages";
import { returnPexelsVideos } from "../PexelsVideos";

const database = createConnection();

let parsedPexelImages = [];
let parsedPexelVideos = [];

export async function fetchAndParsePexelsImagesAndVideosAndReturnOne(
  courseName: string,
  indexSlide: number
): Promise<
  | {
      image: {};
      thumb: {};
      finalImage: {};
      imagesIds: string[];
      urlBing: string;
    }
  | string[]
> {
  let pexelsImagesResponse;
  if (parsedPexelImages.length == 0) {
    pexelsImagesResponse = await returnPexelsImages(courseName);
    parsedPexelImages = pexelsImagesResponse.photos.map((photo) => {
      return photo.src.large;
    });
  }

  let pexelsVideosResponse;
  if (parsedPexelVideos.length == 0) {
    pexelsVideosResponse = await returnPexelsVideos(courseName)
    parsedPexelVideos = pexelsVideosResponse.videos.map((video) => {
      return video.video_files
    })
  }

  // console.log("@@@@@@@@@@@@@@@@@@@@@@@@");
  // console.log("Index slide: " + indexSlide);
  // console.log("@@@@@@@@@@@@@@@@@@@@@@@@");

  if (indexSlide == parsedPexelImages.length - 1) {
    // console.log('REACHED LAST IMAGE.')
    let pexelsImagesResponse2;
    let parsedResults;
    pexelsImagesResponse2 = await returnPexelsImages(courseName);
    parsedResults = pexelsImagesResponse2.photos.map((photo) => {
      return photo.src.large;
    });
    parsedPexelImages = parsedPexelImages.concat(parsedResults);
  }

  //   console.log(parsedResults);

  return {
    image: {},
    thumb: {},
    finalImage: {
      url: parsedPexelImages[indexSlide],
      width: "",
      height: "",
    },
    imagesIds: [],
    urlBing: "",
  };
}

function wait(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

function cleanText(text: string): string {
  return text
    .trimStart()
    .replace(/\n\s*\n/g, "\n")
    .replace(/  +/g, " ")
    .replace(/^ +/gm, "")
    .replace(/(?<=[a-z])\s?\n/, ". ");
}

export async function createContentCycle(
  course: any,
  sectionIndex: number,
  lessonIndex: number
) {
  let payload: paragraphCreation;
  if (!(course.sections && course.sections.length > 0)) {
    await saveLog(
      `Course: ${course.code} has not sections`,
      "Error",
      "createContentCycle()",
      "Courses/{courseCode}/CreateContent"
    );
    return;
  }
  const db = await database;
  const Courses = db.collection("course");
  const startCreation = new Date();
  let totalParagraphsCounter = 0;
  if (!(course.type && course.ty == "resume")) {
    await Courses.findOneAndUpdate(
      { code: course.code },
      {
        $set: {
          sections: course.sections,
          language: course.language,
          languageName: course.languageName,
          voice: course.voice,
        },
      }
    );
    await saveLog(
      `Start content creating for course: ${course.code}`,
      "Info",
      "createContentCycle()",
      "Courses/{courseCode}/CreateContent"
    );
  }
  try {
    let syllabus = course.sections.map((item: any) => {
      return item.title;
    });
    payload = {
      context: course.details.title,
      key: "",
      text: "",
      index: 0,
      maxParagraphs: 15,
      courseStructure: syllabus,
      language: course.language.split("-")[0],
      languageName: course.languageName,
      courseCode: course.code,
    };
    console.info("payload 54", payload);

    // Create Content
    const contentCycle = async (sectionCounter: number) => {
      const lessonCycle = async (lessonCounter: number) => {
        let currentParagraphs: any;
        if (
          course.sections[sectionCounter].elements[lessonCounter].elementLesson
            .paragraphs.length == 0
        ) {
          console.warn("creating paragraphs");
          payload.text = course.sections[sectionCounter].title;
          payload.index = sectionCounter;
          currentParagraphs = await createParagraphs(payload);
          course.sections[currentParagraphs.sectionIndex].elements[
            lessonCounter
          ].elementLesson.paragraphs = currentParagraphs.content.map(
            (text: string) => {
              return { content: text, audioScript: text };
            }
          );
        } else {
          currentParagraphs = {
            content:
              course.sections[sectionCounter].elements[lessonCounter]
                .elementLesson.paragraphs,
            sectionIndex: sectionCounter,
          };
          course.sections[currentParagraphs.sectionIndex].elements[
            lessonCounter
          ].elementLesson.paragraphs = currentParagraphs.content.map(
            (text: string) => {
              return { content: cleanText(text), audioScript: cleanText(text) };
            }
          );
        }
        // Create Audios & find images
        var currentParagrah: any;
        const multimediaCycle = async (paragraphCounter: number) => {
          const paragraphContent = currentParagraphs.content[paragraphCounter];
          // Start creating an audio for a paragraph
          const createAudioFn = async (tries: number) => {
            const currentAudio = await createAudio(
              paragraphContent,
              course.voice,
              course.language,
              course.code,
              currentParagraphs.sectionIndex,
              lessonCounter,
              paragraphCounter
            );
            if (currentAudio.url == undefined) {
              if (tries <= 5) {
                await wait(3 * (tries + 1));
                await createAudioFn(tries + 1);
              } else {
                await saveLog(
                  `Fatal error creating audio for course: ${course.code}, sectionIndex ${currentParagraphs.sectionIndex}.`,
                  "Error",
                  "createAudio()",
                  "Courses/{courseCode}/CreateContent"
                );
              }
            }
            currentParagrah =
              course.sections[currentAudio.sectionIndex].elements[lessonCounter]
                .elementLesson.paragraphs[currentAudio.paragraphIndex];
            console.info(
              `Audio for section ${sectionCounter + 1}/${
                course.sections.length
              }, Lesson ${lessonCounter + 1}, paragraph ${
                paragraphCounter + 1
              }/${currentParagraphs.content.length} created`
            );
            currentParagrah["audioUrl"] = currentAudio.url;
            // srt creation

            // const currentSrt = await createSrt(currentAudio.url, paragraphContent, course.code)
            // currentParagrah["srt"] = currentSrt

            const azureSpeechToText = await createTranscriptionJob(
              course.code,
              currentAudio.sectionIndex,
              lessonCounter,
              currentAudio.paragraphIndex,
              currentAudio.url,
              await returnLanguageAndLocaleFromLanguage(course.language)
            );

            currentParagrah["srt"] = azureSpeechToText;
          };
          await createAudioFn(0);
          saveCourseCreationLog(course.code, course.details.title);

          // Start stract english title for images context searching
          var extractedTitle = {
            title: "",
          };
          const extractTitleFn = async (tries: number) => {
            await wait(3);
            extractedTitle = await extractTitle(
              paragraphContent,
              payload.text,
              course.languageName,
              course.details.title,
              course.code
            );
            if (extractedTitle.title == "") {
              if (tries <= 3) {
                await wait(3 * (tries + 1));
                await extractTitleFn(tries + 1);
              } else {
                extractedTitle = {
                  title: payload.text,
                };
              }
            }
          };
          await extractTitleFn(0);

          console.info(
            `Title for section ${sectionCounter + 1}/${
              course.sections.length
            }, Lesson ${lessonCounter + 1}, paragraph ${paragraphCounter + 1}/${
              currentParagraphs.content.length
            } Extracted `
          );
          currentParagrah["titleAI"] = extractedTitle.title;

          // const currentImageData = await findImages(paragraphContent, extractedTitle.title, payload.text, course.details.title, "wide", course.languageName, [], course.code)
          //   const currentImageData = await findImagesFromAssets(
          //     paragraphContent,
          //     extractedTitle.title,
          //     1,
          //     course.code
          //   );

          const currentImageData =
            await fetchAndParsePexelsImagesAndVideosAndReturnOne(
              course.details.title,
              totalParagraphsCounter
            );

          console.info(
            `Image for section ${sectionCounter + 1}/${
              course.sections.length
            }, Lesson ${lessonCounter + 1}, paragraph ${paragraphCounter + 1}/${
              currentParagraphs.content.length
            } created`
          );
          currentParagrah["imageData"] = currentImageData;

          const createKeyPhrasesFn = async (tries: number) => {
            let keyPhrases = await createkeyphrases(
              paragraphContent,
              course.languageName,
              course.code
            );
            if (keyPhrases == undefined) {
              if (tries <= 3) {
                await wait(3 * (tries + 1));
                await createKeyPhrasesFn(tries + 1);
              } else {
                keyPhrases = [];
              }
            }
            currentParagrah["keyPhrases"] = keyPhrases;
            console.info(
              `KeyPhrases for section ${sectionCounter + 1}/${
                course.sections.length
              }, Lesson ${lessonCounter + 1}, paragraph ${
                paragraphCounter + 1
              }/${currentParagraphs.content.length} created`
            );
          };
          await createKeyPhrasesFn(0);

          //create an empty video structure too
          currentParagrah["videoData"] = {
            thumb: { url: "", width: 0, height: 0 },
            finalVideo: { url: "", width: 0, height: 0 },
          };

          paragraphCounter++;
          totalParagraphsCounter++;

          if (paragraphCounter == currentParagraphs.content.length) {
            if (
              !(
                lessonCounter <
                course.sections[sectionCounter].elements.length - 1
              ) &&
              sectionCounter + 1 == syllabus.length
            ) {
              await saveLog(
                `Finish content creating for course: ${course.code}`,
                "Info",
                "createContentCycle()",
                "Courses/{courseCode}/CreateContent"
              );

              // Save course (in the future be necessary to check if content was 100% fine generated)

              await Courses.findOneAndUpdate(
                { code: course.code },
                {
                  $set: { sections: course.sections },
                }
              );
              const endCreation = new Date();
              const totalCreationTime = Math.abs(
                Math.round(
                  (startCreation.getTime() - endCreation.getTime()) / 1000 / 60
                )
              );
              await saveLog(
                `Update content for course: ${course.code}. ${course.sections.length} Sections and ${totalParagraphsCounter} Slides was created in ${totalCreationTime} minutes.`,
                "Info",
                "createContentCycle()",
                "Courses/{courseCode}/CreateContent"
              );
              deleteCourseCreationLog(course.code);
              updateCourseDuration(course.code);
            } else {
              await Courses.findOneAndUpdate(
                { code: course.code },
                {
                  $set: { sections: course.sections },
                }
              );
              updateCourseDuration(course.code);
              if (
                lessonCounter <
                course.sections[sectionCounter].elements.length - 1
              ) {
                await lessonCycle(lessonCounter + 1);
              } else {
                await contentCycle(sectionCounter + 1);
              }
            }
          } else {
            await multimediaCycle(paragraphCounter);
          }
        };
        await multimediaCycle(0);
        // if (course.sections[sectionCounter].elements.length > (lessonCounter+1)) {
        //     await lessonCycle(lessonCounter+1)
        // }
      };
      await lessonCycle(lessonIndex);
    };
    contentCycle(sectionIndex);
  } catch (error) {
    await saveLog(
      `Bad structure found in course: ${course.code}.`,
      "Error",
      "createContentCycle()",
      "Courses/{courseCode}/CreateContent"
    );
    console.error(error);
    return;
  }
}
