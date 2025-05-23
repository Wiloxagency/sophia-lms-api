import { v4 as uuidv4 } from "uuid";

export const addDocumentsSections = (
  currentCourse: {},
  syllabus: string,
  lessonTheme: string
): {} => {
  // console.log(" syllabus: ", syllabus)
  const structure = syllabus.split("\n");
  let sections = [];
  structure.forEach((section: string) => {
    let lessons = [
      {
        type: "Lección Engine",
        title: "Presentation",
        elementCode: uuidv4(),
        elementLesson: {
          lessonTheme: lessonTheme,
          paragraphs: [],
        },
      },
    ];

    sections.push({
      title: section,
      elements: lessons,
    });
  });
  currentCourse["sections"] = sections;

  return currentCourse;
};


export const addSections = (
  syllabus: string[],
  currentCourse: {},
  lessonTheme: string
): {} => {
  console.log(" lessonTheme: ", lessonTheme);
  console.log(" currentCourse: ", currentCourse);
  console.log(" syllabus: ", syllabus);
  syllabus.forEach((item) => {
    currentCourse["sections"].push({
      title: item,
      elements: [
        {
          type: "Lección Engine",
          title: "Presentation",
          elementCode: uuidv4(),
          elementLesson: {
            lessonTheme: lessonTheme,
          },
        },
      ],
    });
  });
  return currentCourse;
};