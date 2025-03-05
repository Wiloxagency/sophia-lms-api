import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";
import { fillTemplate } from "../CreateContent/fillTemplate";
import { findBestTemplateMatch } from "../CreateContent/findBestTemplateMatch";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const { courseCode, sectionIndex, elementIndex, matchTemplate, slideIndex } = req.body;

    try {
        const db = await database;
        const course = db.collection("course");

        // 1. Find course by courseCode
        const courseData = await course.findOne({ code: courseCode });

        if (!courseData) {
            context.res = {
                status: 404,
                body: "Course not found"
            };
            return;
        }

        // 2. Get slides array from the specified path
        const slides = courseData.sections[sectionIndex]
            ?.elements[elementIndex]
            ?.elementLesson
            ?.slides;

        if (!slides) {
            context.res = {
                status: 404,
                body: "Slides not found"
            };
            return;
        }

        // Format presentation name according to pattern
        const presentationName = `${courseCode}-${sectionIndex}-${elementIndex}`;

        // matchTemplate?: {"courseCode": string, sectionIndex: number, elementIndex: number}
        if (matchTemplate && slideIndex>=0) {
            const templateElement = findBestTemplateMatch(slides[slideIndex].slideContent, "glass")
            slides[slideIndex].slideTemplate = templateElement[0].code
        }

        // Get global presentation data
        const globalData = {
            "defaultTemplate":"GlassTemplate",
            "defaultTheme":courseData.slideshowColorThemeName,
            "musicTrack": courseData.slideshowBackgroundMusicUrl
        }

        // 3. Send slides through fillTemplate function
        await fillTemplate(slides, globalData, presentationName);

        // 4. Return "Ok" response

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { "response": "Ok" }
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: `Error processing request: ${error.message}`
        };
    }
};

export default httpTrigger;