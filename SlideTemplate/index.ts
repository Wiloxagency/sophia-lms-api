import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { CourseData, LessonSlide, SlideTemplates } from "../shared/types";
import { findBestTemplateMatch } from "../CreateContent/findBestTemplateMatch";
import { fillTemplate } from "../CreateContent/fillTemplate";
import {
  fillMissingAssets,
  getMediaTypesForCode,
} from "./layoutAssetsPlaceholder";

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { courseCode, sectionIndex, elementIndex, slideIndex } = req.params;

  try {
    const db = await database;
    const Courses = db.collection<CourseData>("course");
    const course = await Courses.findOne({ code: courseCode });

    if (!course) {
      context.res = {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { response: "Course not found" },
      };
      return;
    }

    const slide: LessonSlide =
      course.sections?.[sectionIndex]?.elements?.[elementIndex]?.elementLesson
        .slides?.[slideIndex];

    if (!slide) {
      context.res = {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { response: "Slide not found" },
      };
      return;
    }

    const assignedTemplate: SlideTemplates = findBestTemplateMatch(
      slide.slideContent,
      course.slideshowColorThemeName
    )[0].code;

    // Get global presentation data
    const globalData = {
      defaultTemplate: "GlassTemplate",
      defaultTheme: course.slideshowColorThemeName,
      musicTrack: course.slideshowBackgroundMusicUrl,
    };

    const presentationName = `${courseCode}-${sectionIndex}-${elementIndex}`;

    await fillTemplate(
      course.sections[sectionIndex].elements[elementIndex].elementLesson.slides,
      globalData,
      presentationName
    );

    const completeAssets = fillMissingAssets(slide, assignedTemplate);

    console.log(" assignedTemplate: ", assignedTemplate);
    console.log(" completeAssets: ", completeAssets);

    const slideTemplatePath = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.slideTemplate`;
    const slideAssetsPath = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets`;

    await Courses.updateOne(
      { code: courseCode },
      {
        $set: {
          [slideTemplatePath]: assignedTemplate,
          [slideAssetsPath]: completeAssets,
        },
      }
    );

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        response: "Slide template assigned",
        slideTemplate: assignedTemplate,
        completeAssets: completeAssets,
      },
    };
  } catch (error) {
    console.error(error);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { response: "Slide template assignment failed" },
    };
  }
};

export default httpTrigger;
