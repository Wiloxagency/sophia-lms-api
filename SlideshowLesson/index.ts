import type { Context, HttpRequest } from "@azure/functions";

import { addIndexesToSlides, createMutableDeepCopy } from "./utils";
import type {
  SlideshowLessonWithExternalInfoFromDatabase,
  SlideshowLessonWithExternalInfoResponse,
} from "./types";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

const database = createConnection();

export default async function (context: Context, req: HttpRequest) {
  const handlers = { GET, PUT, PATCH };

  if (req.method === null || !(req.method in handlers)) {
    context.res = {
      status: 405,
      headers: { "Content-Type": "application/json" },
      body: { error: "Method not allowed." },
    };
    return;
  }

  const currentHandler = handlers[req.method as keyof typeof handlers];
  await currentHandler(context, req);
}

/**
 * Gets the slides if they exist and are up to date, otherwise gets the
 * slideshow lesson.
 */
async function GET(context: Context, req: HttpRequest) {
  const courseId = req.query.courseId as string | undefined;
  const lessonId = req.query.lessonId as string | undefined;

  if (!courseId) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`courseId` is required." },
    };
    return;
  }
  if (!lessonId) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`lessonId` is required." },
    };
    return;
  }

  let slideshowLesson;
  try {
    slideshowLesson = await fetchSlideshowLesson(courseId, lessonId);
  } catch (error) {
    await saveLog(
      `Could not fetch slideshow lesson on the database. Error: ${error}`,
      "Error",
      "fetchSlideshowLesson()",
      "/SlideshowLesson"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Could not fetch slideshow lesson for unknown reasons." },
    };
    return;
  }

  if (!slideshowLesson) {
    context.res = {
      status: 404,
      headers: { "Content-Type": "application/json" },
      body: { error: "Slideshow lesson not found." },
    };
    return;
  }

  // Get the organization logo URL if the slideshow should use it
  let organizationLogoUrl;
  if (slideshowLesson.shouldUseOrganizationLogo) {
    try {
      organizationLogoUrl = await fetchOrganizationLogoUrl(
        slideshowLesson.organizationCode
      );
    } catch (error) {
      await saveLog(
        `Could not fetch organization logo URL on the database. Error: ${error}`,
        "Error",
        "fetchOrganizationLogoUrl()",
        "/SlideshowLesson"
      );
    }
    /* Set the organization logo URL as null if it was not found or could not be
    fetched, so that the client can know that there was a problem */
    organizationLogoUrl ||= null;
  }

  // Creating a mutable deep copy of the slideshow object
  const slideshow = slideshowLesson.elementLesson.slideshow
    ? createMutableDeepCopy(slideshowLesson.elementLesson.slideshow)
    : undefined;
  const hasUpToDateSlides = slideshow !== undefined && !slideshow.isOutdated;

  if (hasUpToDateSlides) {
    // Not all slides should have indexes, but some of them should
    const slidesHaveIndexes = slideshow.slides.some(
      (slide) => slide.lessonParagraphIndex !== undefined
    );

    // If the slides don't have indexes, then try adding them
    if (!slidesHaveIndexes) {
      addIndexesToSlides(
        slideshowLesson.elementLesson.paragraphs,
        slideshow.slides
      );
    }
  }

  /* If the slideshow has slides that are up to date, return them alongside
  other needed properties */
  if (hasUpToDateSlides) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        slides: slideshow.slides,
        backgroundMusicUrl: slideshowLesson.backgroundMusicUrl,
        organizationLogoUrl,
      },
    };
    return;
  }

  // Only setting the properties that are needed for the response
  const slideshowLessonResponse = {
    elementCode: slideshowLesson.elementCode,
    courseCover: slideshowLesson.courseCover,
    sectionTitle: slideshowLesson.sectionTitle,
    colorThemeName: slideshowLesson.colorThemeName,
    backgroundMusicUrl: slideshowLesson.backgroundMusicUrl,
    elementLesson: { paragraphs: slideshowLesson.elementLesson.paragraphs },
    organizationLogoUrl: organizationLogoUrl,
  } satisfies SlideshowLessonWithExternalInfoResponse;

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: slideshowLessonResponse,
  };
}

/** Updates the slideshow lesson with the new slides. */
async function PUT(context: Context, req: HttpRequest) {
  const courseId = req.body.courseId as unknown;
  const lessonId = req.body.lessonId as unknown;
  const slides = req.body.slides as unknown;

  if (typeof courseId !== "string") {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`courseId` must be a string." },
    };
    return;
  }
  if (typeof lessonId !== "string") {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`lessonId` must be a string." },
    };
    return;
  }
  /* TODO: Ask if it's fine to install a validation library to validate the
  slides properly */
  if (!Array.isArray(slides)) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`slides` must be an array." },
    };
    return;
  }

  let result;
  try {
    result = await saveSlidesToSlideshowLesson(courseId, lessonId, slides);
  } catch (error) {
    await saveLog(
      `Could not save slides to slideshow lesson on the database. Error: ${error}`,
      "Error",
      "saveSlidesToSlideshowLesson()",
      "/SlideshowLesson"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: "Could not save slides to slideshow lesson for unknown reasons.",
      },
    };
    return;
  }

  if (result.modifiedCount === 0) {
    context.res = {
      status: 404,
      headers: { "Content-Type": "application/json" },
      body: { error: "Slideshow lesson not found." },
    };
    return;
  }

  context.res = { status: 204 };
}

/**
 * Marks the slides of one or all slideshow lessons of a course as outdated,
 * depending on the request.
 */
async function PATCH(context: Context, req: HttpRequest) {
  const courseId = req.body.courseId as string | undefined;
  const lessonId = req.body.lessonId as string | undefined;

  if (!courseId) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`courseId` is required." },
    };
    return;
  }

  if (!lessonId) {
    await handleMarkSlidesOfAllSlideshowLessonsAsOutdated({
      context,
      courseId,
    });
    return;
  }

  await handleMarkSlideshowLessonSlidesAsOutdated({
    context,
    courseId,
    lessonId,
  });
}

/** Marks the slides of a slideshow lesson as outdated. */
async function handleMarkSlideshowLessonSlidesAsOutdated({
  context,
  courseId,
  lessonId,
}: {
  context: Context;
  courseId: string;
  lessonId: string;
}) {
  let result;
  try {
    result = await markSlideshowLessonSlidesAsOutdated(courseId, lessonId);
  } catch (error) {
    await saveLog(
      `Could not mark slideshow lesson slides as outdated on the database. Error: ${error}`,
      "Error",
      "markSlideshowLessonSlidesAsOutdated()",
      "/SlideshowLesson"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error:
          "Could not mark slideshow lesson slides as outdated for unknown reasons.",
      },
    };
    return;
  }

  if (result.matchedCount === 0) {
    context.res = {
      status: 404,
      headers: { "Content-Type": "application/json" },
      body: { error: "Slideshow lesson not found." },
    };
    return;
  }

  context.res = { status: 204 };
}
// TODO: Test if this updates all the lessons of a course or just the first one
/** Marks the slides of all slideshow lessons of a course as outdated. */
async function handleMarkSlidesOfAllSlideshowLessonsAsOutdated({
  context,
  courseId,
}: {
  context: Context;
  courseId: string;
}) {
  let result;
  try {
    result = await markSlidesOfAllSlideshowLessonsAsOutdated(courseId);
  } catch (error) {
    await saveLog(
      `Could not mark the slides of all slideshow lessons of a course as outdated on the database. Error: ${error}`,
      "Error",
      "markSlidesOfAllSlideshowLessonsAsOutdated()",
      "/SlideshowLesson"
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error:
          "Could not mark the slides of all slideshow lessons of a course as outdated for unknown reasons.",
      },
    };
    return;
  }

  if (result.matchedCount === 0) {
    context.res = {
      status: 404,
      headers: { "Content-Type": "application/json" },
      body: { error: "Course not found." },
    };
    return;
  }

  context.res = { status: 204 };
}

async function fetchSlideshowLesson(courseId: string, lessonId: string) {
  const courseCollection = (await database).collection("course");

  const aggregation = courseCollection.aggregate([
    // Find the course where the slideshow lesson is located
    { $match: { code: courseId } },
    /* Unwind the sections and its elements so the lesson can be grabbed
    separately */
    { $unwind: "$sections" },
    { $unwind: "$sections.elements" },
    // Find the object that contains the lesson
    {
      $match: {
        "sections.elements.elementCode": lessonId,
        "sections.elements.type": "Lección Engine",
      },
    },
    /* Replace the course object with the lesson properties and some other ones
    that are required for generating the slideshow */
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$sections.elements",
            {
              organizationCode: "$organizationCode",
              courseCover: "$details.cover",
              sectionTitle: "$sections.title",
              colorThemeName: "$slideshowColorThemeName",
              backgroundMusicUrl: "$slideshowBackgroundMusicUrl",
              shouldUseOrganizationLogo: "$slideshowShouldUseOrganizationLogo",
            },
          ],
        },
      },
    },
  ]);

  return (await aggregation.toArray())[0] as
    | SlideshowLessonWithExternalInfoFromDatabase
    | undefined;
}

async function saveSlidesToSlideshowLesson(
  courseId: string,
  lessonId: string,
  slides: unknown
) {
  const courseCollection = (await database).collection("course");

  return await courseCollection.updateOne(
    { code: courseId, "sections.elements.elementCode": lessonId },
    {
      $set: {
        "sections.$.elements.$[element].elementLesson.slideshow": {
          slides,
          isOutdated: false,
        },
      },
    },
    {
      arrayFilters: [
        { "element.type": "Lección Engine", "element.elementCode": lessonId },
      ],
    }
  );
}

async function markSlideshowLessonSlidesAsOutdated(
  courseId: string,
  lessonId: string
) {
  const courseCollection = (await database).collection("course");

  return await courseCollection.updateOne(
    { code: courseId, "sections.elements.elementCode": lessonId },
    {
      $set: {
        "sections.$.elements.$[element].elementLesson.slideshow.isOutdated":
          true,
      },
    },
    {
      arrayFilters: [
        {
          "element.type": "Lección Engine",
          "element.elementCode": lessonId,
          "element.elementLesson.slideshow": { $exists: true },
        },
      ],
    }
  );
}

async function markSlidesOfAllSlideshowLessonsAsOutdated(courseId: string) {
  const courseCollection = (await database).collection("course");

  return await courseCollection.updateOne(
    { code: courseId, "sections.elements.type": "Lección Engine" },
    {
      $set: {
        "sections.$[].elements.$[element].elementLesson.slideshow.isOutdated":
          true,
      },
    },
    {
      arrayFilters: [
        {
          "element.type": "Lección Engine",
          "element.elementLesson.slideshow": { $exists: true },
        },
      ],
    }
  );
}

async function fetchOrganizationLogoUrl(organizationId: string) {
  const organizationCollection = (await database).collection("organization");

  const aggregation = organizationCollection.aggregate([
    { $match: { organizationCode: organizationId } },
    { $project: { logo: 1 } },
  ]);
  return (await aggregation.toArray())[0]?.logo as string | undefined;
}
