import { AzureFunction, Context } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { deleteCourseCreationLog, saveLog } from "../shared/saveLog";
<<<<<<< HEAD
// import { createContentCycle } from "../CreateContent/cycle";
import { cleanParagraphs, compareObjectStructures } from "../shared/compareParagraphs"
=======
import { createContentCycle } from "../CreateContent/cycle";
import {
  cleanParagraphs,
  compareObjectStructures,
} from "../shared/compareParagraphs";
>>>>>>> production

const database = createConnection();
const timerTrigger: AzureFunction = async function (
  context: Context,
  myTimer: any
): Promise<void> {
  // return

  if (myTimer.isPastDue) {
    // context.log('Timer function is running late!');
  }
  context.log("Timer trigger function ran at:" + new Date().toISOString());

  // let currentDatePlus5Minutes = new Date(currentDate.getTime() + 2 * 60000)
  const db = await database;
  const CoursesUnderConstructionCollection = db.collection(
    "coursesUnderConstruction"
  );

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  const CoursesUnderConstruction =
    await CoursesUnderConstructionCollection.find({
      timestamp: { $lt: twoMinutesAgo },
    }).toArray();

  if (CoursesUnderConstruction.length == 0) return; // There is not errored courses under construction

  const CoursesUnderConstruction2 =
    await CoursesUnderConstructionCollection.find({
      timestamp: { $gte: twoMinutesAgo },
    }).toArray();

  if (CoursesUnderConstruction2.length > 0) return; // There are courses actually under construction

  // for (let courseUnderConstruction of CoursesUnderConstruction) {

  const courseUnderConstruction = CoursesUnderConstruction[0];

  // console.info("courseUnderConstruction: ", courseUnderConstruction)

  // console.log("IT'S BEEN MORE THANT 2 MINUTES SINCE LAST UPDATE FOR COURSE: " + courseUnderConstruction.courseCode)
  const Courses = db.collection("course");
  const currentCourse = await Courses.findOne({
    code: courseUnderConstruction.courseCode,
  });

<<<<<<< HEAD
    console.log("IT'S BEEN MORE THANT 2 MINUTES SINCE LAST UPDATE FOR COURSE: " + courseUnderConstruction.courseCode)
    const Courses = db.collection('course')
    const currentCourse = await Courses.findOne({ "code": courseUnderConstruction.courseCode })

    try {

        if (currentCourse == null) {
            saveLog(`Unable to reinitialize course creation because course doesn't exist: ${courseUnderConstruction.courseCode}`, "Error", "CreateContentCron()", "CourseCreationCron - index")
            await CoursesUnderConstructionCollection.findOneAndDelete({ "courseCode": courseUnderConstruction.courseCode })
            throw new Error(`Course ${courseUnderConstruction.courseCode} does not exist`)
        }
        saveLog(`Reinitializing course creation: ${courseUnderConstruction.courseCode}`, "Warning", "CreateContentCron()", "CourseCreationCron - index")


        // Verificar si los párrafos tienen la estructura correcta, caso contrareio enviar el índice del párrafo también en createContentCycle

        let courseIsFine = true
        const checkSection = async (sectionIndex: number) => {
            console.info("checkSection: " + sectionIndex)
            const elements = currentCourse.sections[sectionIndex].elements
            // console.info("elements: ", elements)
            if (elements && elements.length > 0) {

                const checkLesson = async (elementIndex: number) => {
                    console.info("checkLesson: " + elementIndex)
                    // console.info(`elements[${elementIndex}]: `, elements[elementIndex])
                    if ((elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length == 0) ||
                        (elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length > 0 && typeof elements[elementIndex].elementLesson.paragraphs[0] === 'string')) {
                        saveLog(`Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}`, "Info", "CreateContentCron()", "CourseCreationCron - index")
                        courseIsFine = false
                        // await createContentCycle(currentCourse, sectionIndex, elementIndex)
                        return
                    } else if (elements[elementIndex].type == "Lección Engine" && elements[elementIndex].elementLesson.paragraphs.length > 0) {
                        elements[elementIndex].elementLesson.paragraphs = await cleanParagraphs(elements[elementIndex].elementLesson.paragraphs, sectionIndex, elementIndex, courseUnderConstruction.courseCode)
                        let paragraphIndex = compareObjectStructures(elements[elementIndex].elementLesson.paragraphs)
                        console.info("paragraphIndex: ", paragraphIndex)
                        if (paragraphIndex >= 0) {
                            console.info(`Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}, paragraph ${paragraphIndex}`)
                            saveLog(`Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}, paragraph ${paragraphIndex}`, "Info", "CreateContentCron()", "CourseCreationCron - index")
                            courseIsFine = false
                            // await createContentCycle(currentCourse, sectionIndex, elementIndex, paragraphIndex)
                            // To force exit: 
                            elementIndex = elements.length 
                            sectionIndex = currentCourse.sections.length
                            return
                        }

                    }

                    if (elementIndex < elements.length - 1) {
                        elementIndex += 1;
                        await checkLesson(elementIndex);
                    }

                }
                console.info("First lesson checking")
                await checkLesson(0)
            }

            if (sectionIndex < currentCourse.sections.length - 1) {
                sectionIndex += 1;
                await checkSection(sectionIndex)
            }
        }
        console.info("First section checking")
        await checkSection(0)
        if (courseIsFine) deleteCourseCreationLog(currentCourse.code, currentCourse.sections);


    } catch (error) {
        await saveLog(`Error resuming course: ${courseUnderConstruction.courseCode}, error: ${error.message}`, "Error", "CreateContent()", "Courses/{courseCode}/CreateContent")
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": "Error creating docx content"
            }
        }
=======
  try {
    if (currentCourse == null) {
      saveLog(
        `Unable to reinitialize course creation because course doesn't exist: ${courseUnderConstruction.courseCode}`,
        "Error",
        "CreateContentCron()",
        "CourseCreationCron - index"
      );
      await CoursesUnderConstructionCollection.findOneAndDelete({
        courseCode: courseUnderConstruction.courseCode,
      });
      throw new Error(
        `Course ${courseUnderConstruction.courseCode} does not exist`
      );
>>>>>>> production
    }
    saveLog(
      `Reinitializing course creation: ${courseUnderConstruction.courseCode}`,
      "Warning",
      "CreateContentCron()",
      "CourseCreationCron - index"
    );

    // Verificar si los párrafos tienen la estructura correcta, caso contrareio enviar el índice del párrafo también en createContentCycle

    let courseIsFine = true;
    const checkSection = async (sectionIndex: number) => {
      // console.info("checkSection: " + sectionIndex)
      const elements = currentCourse.sections[sectionIndex].elements;
      // console.info("elements: ", elements)
      if (elements && elements.length > 0) {
        const checkLesson = async (elementIndex: number) => {
          // console.info("checkLesson: " + elementIndex)
          // console.info(`elements[${elementIndex}]: `, elements[elementIndex])
          if (
            (elements[elementIndex].type == "Lección Engine" &&
              elements[elementIndex].elementLesson.paragraphs.length == 0) ||
            (elements[elementIndex].type == "Lección Engine" &&
              elements[elementIndex].elementLesson.paragraphs.length > 0 &&
              typeof elements[elementIndex].elementLesson.paragraphs[0] ===
                "string")
          ) {
            saveLog(
              `Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}`,
              "Info",
              "CreateContentCron()",
              "CourseCreationCron - index"
            );
            courseIsFine = false;
            await createContentCycle(
              currentCourse,
              sectionIndex,
              elementIndex,
              null,
              currentCourse.isSelfManageable,
              currentCourse.userCode
            );
            return;
          } else if (
            elements[elementIndex].type == "Lección Engine" &&
            elements[elementIndex].elementLesson.paragraphs.length > 0
          ) {
            elements[elementIndex].elementLesson.paragraphs =
              await cleanParagraphs(
                elements[elementIndex].elementLesson.paragraphs,
                sectionIndex,
                elementIndex,
                courseUnderConstruction.courseCode
              );
            let paragraphIndex = compareObjectStructures(
              elements[elementIndex].elementLesson.paragraphs
            );
            // console.info("paragraphIndex: ", paragraphIndex)
            if (paragraphIndex >= 0) {
              console.info(
                `Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}, paragraph ${paragraphIndex}`
              );
              saveLog(
                `Course resume detected, of: ${courseUnderConstruction.courseCode} at section ${sectionIndex}, lesson ${elementIndex}, paragraph ${paragraphIndex}`,
                "Info",
                "CreateContentCron()",
                "CourseCreationCron - index"
              );
              courseIsFine = false;
              await createContentCycle(
                currentCourse,
                sectionIndex,
                elementIndex,
                paragraphIndex,
                currentCourse.isSelfManageable,
                currentCourse.userCode
              );
              // To force exit:
              elementIndex = elements.length;
              sectionIndex = currentCourse.sections.length;
              return;
            }
          }

          if (elementIndex < elements.length - 1) {
            elementIndex += 1;
            await checkLesson(elementIndex);
          }
        };
        // console.info("First lesson checking")
        await checkLesson(0);
      }

      if (sectionIndex < currentCourse.sections.length - 1) {
        sectionIndex += 1;
        await checkSection(sectionIndex);
      }
    };
    // console.info("First section checking")
    await checkSection(0);
    if (courseIsFine)
      deleteCourseCreationLog(currentCourse.code, currentCourse.sections);
  } catch (error) {
    await saveLog(
      `Error resuming course: ${courseUnderConstruction.courseCode}, error: ${error.message}`,
      "Error",
      "CreateContent()",
      "Courses/{courseCode}/CreateContent"
    );
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Error creating docx content",
      },
    };
  }
};

export default timerTrigger;
