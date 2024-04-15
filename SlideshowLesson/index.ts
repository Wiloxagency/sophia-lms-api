import type { Context, HttpRequest } from "@azure/functions";

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

  /* If the slideshow has slides that are up to date, return them alongside
  other needed properties */
  const hasUpToDateSlides =
    slideshowLesson.elementLesson.slideshow &&
    !slideshowLesson.elementLesson.slideshow.isOutdated;
  if (hasUpToDateSlides) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        slides: slideshowLesson.elementLesson.slideshow.slides,
        backgroundMusicUrl: slideshowLesson.backgroundMusicUrl,
        organizationLogoUrl,
      },
    };
    return;
  }

  // Removing properties that are not needed for the response
  delete slideshowLesson.elementLesson.slideshow;
  delete slideshowLesson.organizationCode;
  delete slideshowLesson.shouldUseOrganizationLogo;

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      ...slideshowLesson,
      organizationLogoUrl,
    },
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

/** Marks the slides of a slideshow lesson as outdated. */
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
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "`lessonId` is required." },
    };
    return;
  }

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

  return (await aggregation.toArray())[0];
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

async function fetchOrganizationLogoUrl(organizationId: string) {
  const organizationCollection = (await database).collection("organization");

  const aggregation = organizationCollection.aggregate([
    { $match: { organizationCode: organizationId } },
    { $project: { logo: 1 } },
  ]);
  return (await aggregation.toArray())[0]?.logo as string | undefined;
}
