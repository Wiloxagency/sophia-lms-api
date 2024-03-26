import { createAudio } from "./createAudios";
import { createConnection } from "../shared/mongo";
import { createParagraphs } from "./createParagrahs";
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
import { returnPexelsImages } from "../PexelsImages/shared";
import { returnPexelsVideos } from "../PexelsVideos/shared";
import { translateQuery, translateToLanguage } from "../shared/translator";

const database = createConnection();

let previousCourseName: string;

let parsedPexelsImages: {
  url: string;
  resizedWidth: number;
  resizedHeight: number;
}[] = [];

let parsedPexelsVideos: { url: string; height: number; width: number }[] = [];

async function fetchAndParsePexelsImagesAndVideosAndReturnOne(
  courseName: string,
  indexSlide: number,
  currentImageCounter: number,
  currentVideoCounter: number
): Promise<
  | {
      image: {};
      thumb: {};
      finalImage: {};
      imagesIds: string[];
      urlBing: string;
    }
  | {
      thumb: {
        url: string;
        width: number;
        height: number;
      };
      finalVideo: {
        url: string;
        width: number;
        height: number;
      };
    }
> {
  if (previousCourseName != courseName) {
    parsedPexelsImages = [];
    parsedPexelsVideos = [];
  }

  let pexelsImagesResponse;
  if (parsedPexelsImages.length == 0) {
    pexelsImagesResponse = await returnPexelsImages(courseName);
    parsedPexelsImages = await Promise.all(
      pexelsImagesResponse.photos.map(async (photo) => {
        const returnNewImageSizesResponse = await returnImageSizes(
          photo.height,
          photo.width
        );

        return {
          url: photo.src.large,
          resizedHeight: returnNewImageSizesResponse.resizedHeight,
          resizedWidth: returnNewImageSizesResponse.resizedWidth,
        };
      })
    );
  }

  let pexelsVideosResponse;
  if (parsedPexelsVideos.length == 0) {
    pexelsVideosResponse = await returnPexelsVideos(courseName);
    await processPexelsVideosResponse(pexelsVideosResponse);
  }

  if (indexSlide == parsedPexelsImages.length + parsedPexelsVideos.length - 1) {
    console.log("REACHED LAST RESOURCE.");
    let pexelsImagesResponse2;
    let parsedPexelsImages2;
    pexelsImagesResponse2 = await returnPexelsImages(courseName);
    parsedPexelsImages2 = await Promise.all(
      pexelsImagesResponse2.photos.map(async (photo) => {
        const returnNewImageSizesResponse2 = await returnImageSizes(
          photo.height,
          photo.width
        );
        return {
          url: photo.src.large,
          resizedHeight: returnNewImageSizesResponse2.resizedHeight,
          resizedWidth: returnNewImageSizesResponse2.resizedWidth,
        };
      })
    );
    parsedPexelsImages = parsedPexelsImages.concat(parsedPexelsImages2);

    let pexelsVideosResponse2;
    pexelsVideosResponse2 = await returnPexelsVideos(courseName);
    await processPexelsVideosResponse(pexelsVideosResponse2);
  }

  let isEvenNumber = indexSlide % 2 == 0 ? true : false;

  if (isEvenNumber) {
    // console.log("currentImageCounter: ", currentImageCounter);
    currentImageCounter++;
  } else {
    // console.log("currentVideoCounter: ", currentVideoCounter);
    currentVideoCounter++;
  }

  // if (isEvenNumber) {
  //   console.log(parsedPexelImages[currentImageCounter]);
  // } else {
  //   console.log(parsedPexelVideos[currentVideoCounter]);
  // }

  return isEvenNumber
    ? {
        image: {},
        thumb: {},
        finalImage: {
          url: parsedPexelsImages[currentImageCounter].url,
          width: parsedPexelsImages[currentImageCounter].resizedWidth,
          height: parsedPexelsImages[currentImageCounter].resizedHeight,
        },
        imagesIds: [],
        urlBing: "",
      }
    : {
        thumb: {
          url: "",
          width: 0,
          height: 0,
        },
        finalVideo: {
          url: parsedPexelsVideos[currentVideoCounter].url,
          height: parsedPexelsVideos[currentVideoCounter].height,
          width: parsedPexelsVideos[currentVideoCounter].width,
        },
      };
}

async function returnImageSizes(
  height: number,
  width: number
): Promise<{
  resizedHeight: number;
  resizedWidth: number;
}> {
  let resizedHeight;
  let resizedWidth;
  if (width > height) {
    // console.log("IMAGE IS LANDSCAPE");
    resizedWidth = 940;
    resizedHeight = (940 * height) / width;
  } else if (width < height) {
    // console.log("IMAGE IS PORTRAIT");
    resizedHeight = 650;
    resizedWidth = (650 * width) / height;
  } else {
    resizedHeight = 650;
    resizedWidth = 650;
  }
  return { resizedHeight: resizedHeight, resizedWidth: resizedWidth };
}

async function processPexelsVideosResponse(pexelsVideosResponse) {
  let videoResultsCache = [];

  for (const video of pexelsVideosResponse.videos) {
    let filteredVideos = video.video_files.filter((videoFile) => {
      return videoFile.quality == "hd";
    });

    if (filteredVideos.length > 1) {
      // console.log("Multiple HD videos detected. Choosing highest quality one");

      if (
        filteredVideos[0].height + filteredVideos[0].width >
        filteredVideos[1].height + filteredVideos[1].width
      ) {
        videoResultsCache.push(filteredVideos[0]);
      } else {
        videoResultsCache.push(filteredVideos[1]);
      }
    } else {
      videoResultsCache.push(filteredVideos[0]);
    }
  }

  videoResultsCache = videoResultsCache.map((video, index) => {
    // console.log(video)
    // console.log(video.link)
    console.log(index);
    if (video != undefined)
      return { url: video.link, height: video.height, width: video.width };
  });

  parsedPexelsVideos = parsedPexelsVideos.concat(videoResultsCache);
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
  let currentImageCounter = 0;
  let currentVideoCounter = 0;
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
    // console.info("payload 54", payload);

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
              return { content: cleanText(text), audioScript: cleanText(text) };
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

        let currentParagraphArrayPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs`;

        await Courses.findOneAndUpdate(
          { code: course.code },
          {
            $set: {
              [currentParagraphArrayPath]:
                course.sections[sectionCounter].elements[lessonCounter]
                  .elementLesson.paragraphs,
            },
          }
        );

        // Create Audios & find images
        var currentParagrah: any;
        const multimediaCycle = async (paragraphCounter: number) => {
          let currentParagraphPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}`;
          let currentParagraphAudioUrlPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}.audioUrl`;
          let currentParagraphTitleAIPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}.titleAI`;
          let currentParagraphTranslatedTitleAIPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}.translatedTitleAI`;
          let currentParagraphImageDataPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}.imageData`;
          let currentParagraphVideoDataPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}.videoData`;
          let currentParagraphKeyPhrasesPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs.${paragraphCounter}.keyPhrases`;

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
            // console.info(
            //   `Audio for section ${sectionCounter + 1}/${
            //     course.sections.length
            //   }, Lesson ${lessonCounter + 1}, paragraph ${
            //     paragraphCounter + 1
            //   }/${currentParagraphs.content.length} created`
            // );
            currentParagrah["audioUrl"] = currentAudio.url;

            await Courses.findOneAndUpdate(
              { code: course.code },
              {
                $set: {
                  [currentParagraphAudioUrlPath]: currentAudio.url,
                },
              }
            );
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

            // currentParagrah["srt"] = azureSpeechToText;
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

          // console.info(
          //   `Title for section ${sectionCounter + 1}/${
          //     course.sections.length
          //   }, Lesson ${lessonCounter + 1}, paragraph ${paragraphCounter + 1}/${
          //     currentParagraphs.content.length
          //   } Extracted `
          // );
          currentParagrah["titleAI"] = extractedTitle.title;

          const translatedTitleAi = await translateToLanguage(
            extractedTitle.title,
            course.language
          );

          await Courses.findOneAndUpdate(
            { code: course.code },
            {
              $set: {
                [currentParagraphTitleAIPath]: extractedTitle.title,
                [currentParagraphTranslatedTitleAIPath]: translatedTitleAi,
              },
            }
          );

          // const currentImageData = await findImages(paragraphContent, extractedTitle.title, payload.text, course.details.title, "wide", course.languageName, [], course.code)
          //   const currentImageData = await findImagesFromAssets(
          //     paragraphContent,
          //     extractedTitle.title,
          //     1,
          //     course.code
          //   );

          // 👇🏻ADD IMAGE/VIDEO TO SLIDE 🖼️📽️

          if (totalParagraphsCounter % 2 == 0) {
            // IS IMAGE 🖼️
            const currentImageData =
              await fetchAndParsePexelsImagesAndVideosAndReturnOne(
                course.details.title,
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
              { code: course.code },
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
                course.details.title,
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
              { code: course.code },
              {
                $set: {
                  [currentParagraphVideoDataPath]: currentVideoData,
                  [currentParagraphImageDataPath]: currentParagrah["videoData"],
                },
              }
            );
          }

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

            await Courses.findOneAndUpdate(
              { code: course.code },
              {
                $set: {
                  [currentParagraphKeyPhrasesPath]: keyPhrases,
                },
              }
            );

            // console.info(
            //   `KeyPhrases for section ${sectionCounter + 1}/${
            //     course.sections.length
            //   }, Lesson ${lessonCounter + 1}, paragraph ${
            //     paragraphCounter + 1
            //   }/${currentParagraphs.content.length} created`
            // );
          };
          await createKeyPhrasesFn(0);

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

              // await Courses.findOneAndUpdate(
              //   { code: course.code },
              //   {
              //     $set: { sections: course.sections },
              //   }
              // );
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
              parsedPexelsImages = [];
            } else {
              // await Courses.findOneAndUpdate(
              //   { code: course.code },
              //   {
              //     $set: { sections: course.sections },
              //   }
              // );
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
