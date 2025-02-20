import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
const database = createConnection();

export type LessonParagraph = {
  content: string;
  audioScript: string;
  audioUrl: string;
  srt: string;
  titleAI: string;
  imageData: {
    image: {};
    thumb: {};
    finalImage: {
      url: string;
      width: number;
      height: number;
    },
    imagesIds: [];
    urlBing: string;
  },
  keyPhrases: [string];
  videoData: {
    thumb: {
      url: string;
      width: number;
      height: number;
    },
    finalVideo: {
      url: string;
      width: number;
      height: number;
    }
  }
}

export type LessonSlide = {
  canvasElements: (
    | { type: "text"; text: string }
    | { type: "image" | "video" | "rect" }
  )[];
  lessonParagraphIndex?: number;
};

export type LessonElement = {
  type: 'Lección Engine';
  title: string;
  elementCode: string;
  elementLesson: {
    lessonTheme: string;
    paragraphs?: LessonParagraph[];
    slides?: LessonSlide[];
  };
};

export type CompletionElement = {
  type: 'completion';
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    quizz_list: {
      question: `Frase principal: ${string}\nPalabra extraída: ${string}`;
    }[];
    isAICreated: boolean;
    isSectionQuiz?: boolean;
  };
};

export type FileElement = {
  type: 'file';
  title: string;
  /** UUID */
  elementCode: string;
  elementFile: {
    name: string;
    url: string;
  };
};

export type HtmlElement = {
  type: 'html';
  title: string;
  /** UUID */
  elementCode: string;
  elementText: {
    title: string;
    /** Cover image URL */
    cover: string;
    content: string;
  };
}

export type QuizElement = {
  type: 'quizz';
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    isAICreated: boolean;
    isSectionQuiz?: boolean;
    quizz_list: [
      statement: string,
      correctAnswer: string,
      ...otherAnswers: string[]
    ][];
  };
};

export type ShortAnswerElement = {
  type: 'shortAnswer';
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    quizz_list: { question: string; source?: string }[];
    isAICreated: boolean;
    isSectionQuiz?: boolean;
  };
}

export type TrueOrFalseElement = {
  type: 'trueOrFalse';
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    isAICreated: boolean;
    isSectionQuiz?: boolean;
    quizz_list: {
      /** A false statement */
      true: string;
      /** A true statement */
      false: string;
      source: string;
    }[];
  };
};

export type VideoElement = {
  type: 'video_url';
  title: string;
  /** UUID */
  elementCode: string;
  elementVideo: {
    url: string;
  };
};


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {


  const updateSectionTitle = async () => {

    let courseCode = req.params.courseCode;
    let sectionIndex = parseInt(req.query.section);
    let newTitle = req.body.title;

    try {
      const db = await database;
      const Courses = db.collection('course');
      const response = Courses.findOne({ "code": courseCode });
      const body = await response;

      if (body) {
        const sections = body['sections'];
        if (sections.length - 1 < sectionIndex || sectionIndex < 0) {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error, section not found valid sections are 0-" + (sections.length - 1),
            },
          };

        } else {

          const updateQuery = {};
          updateQuery[`sections.${sectionIndex}.title`] = newTitle;

          const updatedDocument = await Courses.findOneAndUpdate(
            { code: courseCode },
            { $set: updateQuery }
          );

          if (updatedDocument) {
            context.res = {
              status: 201,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                response: "Correct update course title"
              },
            };
          } else {
            context.res = {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "Error updating course title",
              },
            };
          }
        }
      }


    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting element in course with code " + courseCode,
        },
      };
    }
  }

  const getElement = async () => {

    let sectionIndex = parseInt(req.query.section);
    let elementIndex = parseInt(req.query.element);
    let courseCode = req.params.courseCode;

    try {

      const db = await database;
      const Courses = db.collection('course');
      const response = Courses.findOne({ "code": courseCode });
      const body = await response;

      if (body) {
        const sections = body['sections'];
        if (sections.length - 1 < sectionIndex || sectionIndex < 0) {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error, section not found valid sections are 0-" + (sections.length - 1),
            },
          };

        } else {

          if (sections[sectionIndex].elements.length - 1 < elementIndex || elementIndex < 0) {
            context.res = {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "Error, element index not found, valid element index are 0-" + (sections[sectionIndex].elements.length - 1),
              },
            };
            return;
          }

          const element = [];

          const componentToExtractData = sections[sectionIndex].elements[elementIndex]

          switch (componentToExtractData.type) {
            case "Lección Engine":
              let lessonElement: LessonElement = componentToExtractData;
              element.push(lessonElement)
              break;
            case "completion":
              let completionElement: CompletionElement = componentToExtractData;
              element.push(completionElement)
              break;
            case "file":
              let fileElement: FileElement = componentToExtractData;
              element.push(fileElement)
              break;
            case "html":
              let htmlElement: HtmlElement = componentToExtractData;
              element.push(htmlElement)
              break;
            case "quizz":
              let quizElement: QuizElement = componentToExtractData;
              element.push(quizElement)
              break;
            case "shortAnswer":
              let shortAnswerElement: ShortAnswerElement = componentToExtractData;
              element.push(shortAnswerElement)
              break;
            case "trueOrFalse":
              let trueOrFalseElement: TrueOrFalseElement = componentToExtractData;
              element.push(trueOrFalseElement)
              break;
            case "video_url":
              let videoElement: VideoElement = componentToExtractData;
              element.push(videoElement)
              break;

            default:
              element.push(componentToExtractData)
              break;
          }

          context.res = {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              element: element
            }
          };
        }
      } else {
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Error getting course by code",
          },
        };
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting element in course with code " + courseCode,
        },
      };
    }
  };

  const updateLesson = async () => {

    let courseCode = req.params.courseCode;
    let sectionIndex = parseInt(req.query.section);
    let elementIndex = parseInt(req.query.element);
    //let lessonIndex = parseInt(req.query.lesson);
    let updateData = req.body;

    try {
      const db = await database;
      const Courses = db.collection('course');
      const response = Courses.findOne({ "code": courseCode });
      const body = await response;

      if (body) {
        const sections = body['sections'];
        if (sections.length - 1 < sectionIndex || sectionIndex < 0) {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error, section not found valid sections are 0-" + (sections.length - 1),
            },
          };

        } else {

          const updateQuery = {};

          if (updateData.titleElement) {
            updateQuery[`sections.${sectionIndex}.elements.${elementIndex}.title`] = updateData.titleElement;
          }
          if (updateData.lessonTheme) {
            updateQuery[`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.lessonTheme`] = updateData.lessonTheme;
          }

          if (Object.keys(updateQuery).length === 0) {
            context.res = {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "There are no fields to update",
              },
            };
          }

          const body = await Courses.findOneAndUpdate(
            { code: courseCode },
            { $set: updateQuery }
          );

          if (body) {
            context.res = {
              status: 201,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                response: "Correct update course Lesson"
              },
            };
          } else {
            context.res = {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "Error updating course Lesson",
              },
            };
          }
        }
      }


    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting element in course with code " + courseCode,
        },
      };
    }
  };


  const updateSlide = async () => {
    let courseCode = req.params.courseCode;
    let sectionIndex = parseInt(req.query.section);
    let elementIndex = parseInt(req.query.element);
    let paragraphIndex = parseInt(req.query.paragraph);
    let updateData = req.body;

    try {
      const db = await database;
      const Courses = db.collection('course');
      const response = Courses.findOne({ "code": courseCode });
      const body = await response;

      if (body) {
        const sections = body['sections'];
        if (sections.length - 1 < sectionIndex || sectionIndex < 0) {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error, section not found valid sections are 0-" + (sections.length - 1),
            },
          };

        } else {
          if (sections[sectionIndex].elements.length - 1 < elementIndex || elementIndex < 0 || sections[sectionIndex].elements[elementIndex].elementLesson.paragraphs.length - 1 || paragraphIndex < 0) {
            context.res = {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "Error, elements or paragraph not found valid elements are 0-" + (sections[sectionIndex].elements.length - 1) + " valid paragraph are 0-" + (sections[sectionIndex].elements[elementIndex].elementLesson.paragraphs.length - 1),
              },
            };
          } else {
            const updateQuery = {};
            // Mapeo de los posibles campos a actualizar
            const fields = [
              "slideTemplate",
              "audioScript",
              "audioUrl",
              "alternativePronunciations",
              "imageData",
              "videoData"
            ];

            fields.forEach(field => {
              if (updateData[field] !== undefined) {
                updateQuery[`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs.${paragraphIndex}.${field}`] = updateData[field];
              }
            });

            if (Object.keys(updateQuery).length === 0) {
              context.res = {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
                body: {
                  message: "There are no fields to update",
                },
              };
            }

            const body = await Courses.findOneAndUpdate(
              { code: courseCode },
              { $set: updateQuery }
            );

            if (body) {
              context.res = {
                status: 201,
                headers: {
                  "Content-Type": "application/json",
                },
                body: {
                  response: "Correct update course Slide"
                },
              };
            } else {
              context.res = {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                },
                body: {
                  message: "Error updating course Slide",
                },
              };
            }
          }

        }
      }


    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting element in course with code " + courseCode,
        },
      };
    }
  };


  const deleteSlide = async () => {

    let courseCode = req.params.courseCode;
    let sectionIndex = parseInt(req.query.section);
    let elementIndex = parseInt(req.query.element);
    let paragraphIndex = parseInt(req.query.paragraph);

    try {
      const db = await database;
      const Courses = db.collection('course');
      const response = Courses.findOne({ "code": courseCode });
      const body = await response;

      if (body) {
        const sections = body['sections'];
        if (sections.length - 1 < sectionIndex || sectionIndex < 0) {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error, section not found valid sections are 0-" + (sections.length - 1),
            },
          };

        } else {
           
          if (sections[sectionIndex].elements.length - 1 < elementIndex || elementIndex < 0 || sections[sectionIndex].elements[elementIndex].elementLesson.paragraphs.length - 1 < paragraphIndex || paragraphIndex < 0) {
            context.res = {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                message: "Error, elements or paragraph not found valid elements are 0-" + (sections[sectionIndex].elements.length - 1) + " valid paragraphs are 0-" + (sections[sectionIndex].elements[elementIndex].elementLesson.paragraphs.length - 1),
              },
            };
          } else {

            try {

              const paragraphDelete = sections[sectionIndex].elements[elementIndex].elementLesson.paragraphs[paragraphIndex];

              const update1 = await Courses.updateOne(
                { code: courseCode },
                {
                  $pull:
                  {
                    [`sections.${sectionIndex}.elements.${elementIndex}.elementLesson.paragraphs`]: paragraphDelete
                  }
                }
              )

              if (update1) {
                context.res = {
                  status: 201,
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: {
                    response: "Correct delete course Slide"
                  },
                };
              } else {
                context.res = {
                  status: 500,
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: {
                    message: "Error deleting course Slide",
                  },
                };
              }
            } catch (error) {
              context.res = {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                },
                body: {
                  message: "Error deleting Slide" + error,
                },
              };
            }
          }
        }
      }
    } catch (error) {
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting Slide" + error,
        },
      };
    }

  };


  switch (req.method) {

    case "PUT":
      if (req.query.paragraph) {
        await updateSlide();
      } else if (req.query.element) {
        await updateLesson();
      } else {
        await updateSectionTitle();
      }
      break;

    case "DELETE":
      await deleteSlide();
      break;

    case "GET":
      await getElement();
      break;

    default:
      break;
  }
};

export default httpTrigger;
