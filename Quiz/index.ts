import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { downloadQuiz } from "./download";
import OpenAI from "openai";
import { updateCourseTokens } from "../Course/courseTokenCounter";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const createShortAnswerQuiz = async () => {
    try {
      const db = await database;
      const Courses = db.collection("course");
      // console.log(req.body)
      let coursePromise = Courses.findOne({ code: req.body.courseCode });
      let course = await coursePromise;
      let lessonFirst5Paragraphs = course.sections[
        req.body.indexSection
      ].elements[req.body.indexElement].elementLesson.paragraphs.slice(0, 5);
      let quizList = [];
      for (const paragraph of lessonFirst5Paragraphs) {
        const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content:
                // "Redacta una pregunta basada en el siguiente párrafo: " +
                "Generate an open-ended question based on the information provided in the text. Ensure that the question can be answered using the given information. Respond in Spanish: " +
                paragraph.content,
            },
          ],
        });

        updateCourseTokens(req.body.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        quizList.push({
          question: response.choices[0].message.content,
          source: paragraph.content,
        });
      }
      // console.log(quizList)
      let sectionElementsPath = `sections.${req.body.indexSection}.elements`;
      let quizz_list = quizList;
      let quizElementPayload = {
        type: "shortAnswer",
        title: "Quiz",
        quizCode: req.body.quizCode,
        elementQuiz: {
          quizz_list: quizz_list,
          isAICreated: true,
        },
      };
      // sectionElements.push(quizElementPayload);
      // console.log(sectionElements)

      const updatePromise = Courses.updateOne(
        { code: req.body.courseCode },
        { $push: { [sectionElementsPath]: quizElementPayload } }
      );
      await updatePromise;
      // console.log(response.data.choices[0].message.content)
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: quizList,
      };
    } catch (error) {
      // console.log(error)
      await saveLog(
        `Error creating a quizz for: ${req.body.courseCode}, error ${error.message}`,
        "Error",
        "createShortAnswerQuiz()",
        "Quiz"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const createMultipleChoiceQuiz = async () => {
    try {
      const db = await database;
      const Courses = db.collection("course");
      // console.log(req.body)
      let coursePromise = Courses.findOne({ code: req.body.courseCode });
      let course = await coursePromise;
      let lessonFirst5Paragraphs = course.sections[
        req.body.indexSection
      ].elements[req.body.indexElement].elementLesson.paragraphs.slice(0, 5);
      let quizList = [];
      for (const paragraph of lessonFirst5Paragraphs) {
        const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content:
                "Extract from the following text 4 options for a multiple choice test, only one of the options will be the correct answer. Deliver your response in Spanish in valid json format as an array of strings. The first string corresponds to the question, the second to the correct answer, the third, fourth and fifth to false answers: " +
                paragraph.content,
            },
          ],
        });

        updateCourseTokens(req.body.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        let firstStepParsing =
          response.choices[0].message.content.split("[")[1];
        let secondStepParsing = firstStepParsing.split("]")[0];
        let thirdStepParsing = JSON.parse("[" + secondStepParsing + "]");

        // console.log(thirdStepParsing);

        quizList.push(thirdStepParsing);
      }
      let sectionElementsPath = `sections.${req.body.indexSection}.elements`;
      let quizz_list = quizList;
      let quizElementPayload = {
        type: "quizz",
        title: "Quiz",
        quizCode: req.body.quizCode,
        elementQuiz: {
          quizz_list: quizz_list,
          isAICreated: true,
        },
      };
      // sectionElements.push(quizElementPayload);
      // console.log(sectionElements)

      const updatePromise = Courses.updateOne(
        { code: req.body.courseCode },
        { $push: { [sectionElementsPath]: quizElementPayload } }
      );
      await updatePromise;
      // console.log(response.data.choices[0].message.content)
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: quizList,
      };
    } catch (error) {
      // console.log(error)
      await saveLog(
        `Error creating a quizz for: ${req.body.courseCode}, error ${error.message}`,
        "Error",
        "createShortAnswerQuiz()",
        "Quiz"
      );

      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const createCompletionQuiz = async () => {
    try {
      const db = await database;
      const Courses = db.collection("course");
      // console.log(req.body)
      let coursePromise = Courses.findOne({ code: req.body.courseCode });
      let course = await coursePromise;
      let lessonFirst5Paragraphs = course.sections[
        req.body.indexSection
      ].elements[req.body.indexElement].elementLesson.paragraphs.slice(0, 5);
      let quizList = [];
      for (const paragraph of lessonFirst5Paragraphs) {
        const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content:
                "Redacta la frase principal del texto suministrado. De esta frase deberás extraer la palabra principal. Tu respuesta debe ser concisa y debe seguir el siguiente formato: Frase principal: Palabra extraída: El texto suministrado es: " +
                paragraph.content,
              // content: "Extrae la frase principal de un texto que te suministraré al final de estas especificaciones, para ser usada como una actividad de completación. La completación debe ocurrir en la palabra principal de la frase principal extraída. Solo debe haber una completación. La respuesta debe ser concisa y debe seguir el siguiente formato: Frase principal: Palabra extraída: El texto suministrado es: " + paragraph.content
            },
          ],
        });

        updateCourseTokens(req.body.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        let completionQuizParts = response.choices[0].message.content
          .split("Frase principal: ")
          .pop()
          .split("Palabra extraída: ");
        if (completionQuizParts.length == 2) {
          let keyword = completionQuizParts[1]
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .toLowerCase();
          // console.log('_____________________________________________________')

          // quizList.push(completionQuizParts[0])

          // console.log(completionQuizParts[0])
          // console.log(keyword)
          // console.log(completionQuizParts[0].toLowerCase().includes(keyword))

          if (completionQuizParts[0].toLowerCase().includes(keyword)) {
            quizList.push({
              question: response.choices[0].message.content,
            });
          }
        } else {
          console.log("OPENAI DID NOT RETURN A PROPERLY FORMATTED RESPONSE");
          console.log("OPENAI RESPONSE:");
          console.log("response.data.choices[0].message.content");
        }
      }
      // console.log(quizList)
      let sectionElementsPath = `sections.${req.body.indexSection}.elements`;
      // let sectionElements = course.sections[req.body.indexSection].elements;
      let quizz_list = quizList;
      let quizElementPayload = {
        type: "completion",
        title: "Quiz",
        quizCode: req.body.quizCode,
        elementQuiz: {
          quizz_list: quizz_list,
          isAICreated: true,
        },
      };
      // sectionElements.push(quizElementPayload);
      // console.log(sectionElements)
      const updatePromise = Courses.updateOne(
        { code: req.body.courseCode },
        {
          $push: { [sectionElementsPath]: quizElementPayload },
        }
      );
      await updatePromise;
      // console.log(response.data.choices[0].message.content)
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: quizList,
      };
    } catch (error) {
      await saveLog(
        `Error creating a quizz for: ${req.body.courseCode}, error ${error.message}`,
        "Error",
        "createCompletionQuiz()",
        "Quiz"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const createTrueOrFalseQuiz = async () => {
    try {
      const db = await database;
      const Courses = db.collection("course");
      // console.log(req.body)
      let coursePromise = Courses.findOne({ code: req.body.courseCode });
      let course = await coursePromise;
      let lessonFirst5Paragraphs = course.sections[
        req.body.indexSection
      ].elements[req.body.indexElement].elementLesson.paragraphs.slice(0, 5);
      let quizList = [];
      for (const paragraph of lessonFirst5Paragraphs) {
        const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content:
                "Redacta la frase principal del texto suministrado. De esta frase deberás crear dos versiones. La primera versión será una afirmación verdadera. La segunda versión será un afirmación falsa. Tu respuesta debe ser concisa y debe seguir el siguiente formato: Frase verdadera: Frase falsa: El texto suministrado es: " +
                paragraph.content,
            },
          ],
        });

        updateCourseTokens(req.body.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        // console.log('______________________________________________________')
        // console.log('OPENAI RESPONSE')
        // console.log(response.data.choices[0].message.content)
        // console.log('______________________________________________________')
        // return
        let trueOrFalseQuizParts = response.choices[0].message.content
          .split("Frase verdadera: ")
          .pop()
          .split("Frase falsa: ");
        if (trueOrFalseQuizParts.length == 2) {
          // console.log(trueOrFalseQuizParts[0])
          // console.log(trueOrFalseQuizParts[1])
          quizList.push({
            true: trueOrFalseQuizParts[0],
            false: trueOrFalseQuizParts[1],
            source: paragraph.content,
          });
        } else {
          console.log("______________________________________________________");
          console.log("OPENAI DID NOT RETURN A PROPERLY FORMATTED RESPONSE");
          console.log("OPENAI RESPONSE:");
          console.log("response.data.choices[0].message.content");
          console.log("______________________________________________________");
        }
      }
      // console.log(quizList)
      let sectionElementsPath = `sections.${req.body.indexSection}.elements`;
      // let sectionElements = course.sections[req.body.indexSection].elements;
      let quizz_list = quizList;
      let quizElementPayload = {
        type: "trueOrFalse",
        title: "Quiz",
        quizCode: req.body.quizCode,
        elementQuiz: {
          quizz_list: quizz_list,
          isAICreated: true,
        },
      };
      // sectionElements.push(quizElementPayload)
      // console.log(sectionElements)
      const updatePromise = Courses.updateOne(
        { code: req.body.courseCode },
        {
          $push: { [sectionElementsPath]: quizElementPayload },
        }
      );
      await updatePromise;
      // console.log(response.data.choices[0].message.content)
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: quizList,
      };
    } catch (error) {
      await saveLog(
        `Error creating a quizz for: ${req.body.courseCode}, error ${error.message}`,
        "Error",
        "createTrueOrFalseQuiz()",
        "Quiz"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const correctCompletionQuiz = async () => {
    try {
      let GPTResponses = [];
      for (const quiz of req.body.quizData) {
        // console.log(quiz)
        let firstPrompt = `Texto:
                ${quiz.source}
                Mi respuesta:
                ${quiz.studentFullResponse}
                ¿Son el texto original y mi respuesta equivalentes? Ignora diferencias en letras mayúsculas o minúsculas. Responde usando sólo 2 letras: sí o no`;
        const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: firstPrompt,
            },
          ],
        });

        updateCourseTokens(req.body.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        // console.log(response.data.choices[0].message.content)
        if (response.choices[0].message.content.toLowerCase().includes("s")) {
          // console.log('SÍ: ')
          // console.log(response.data.choices[0].message.content)
          GPTResponses.push({ result: "Correcto" });
        } else if (
          response.choices[0].message.content.toLowerCase().includes("n")
        ) {
          // console.log('NO: ')
          // console.log(response.data.choices[0].message.content)
          const response2 = await openai.chat.completions.create({
            model: "gpt-4-0125-preview",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant.",
              },
              {
                role: "user",
                content: firstPrompt,
              },
              {
                role: "assistant",
                content: response.choices[0].message.content,
              },
              {
                role: "user",
                content: "Explica por qué no.",
              },
              // ${quiz.studentResponse}
              // ¿La respuesta completa correctamente la actividad de completación?
            ],
          });

          updateCourseTokens(req.body.courseCode, response2.usage.prompt_tokens, response2.usage.completion_tokens);

          GPTResponses.push({
            result: response2.choices[0].message.content,
          });
        }
        // console.log(response.data.choices[0].message.content)
      }
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: GPTResponses,
      };
    } catch (error) {
      await saveLog(
        `Error creating a quizz for: ${req.body.courseCode}, error ${error.message}`,
        "Error",
        "correctCompletionQuiz()",
        "Quiz"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  const correctShortAnswerQuiz = async () => {
    try {
      let GPTResponses = [];
      for (const quiz of req.body.quizData) {
        // console.log(quiz)
        let firstPrompt = `Fuente:
                ${quiz.source}
                Pregunta basada en la fuente:
                ${quiz.question}
                Mi respuesta:
                ${quiz.answer}
                ¿Mi respuesta es correcta? Responde usando sólo 2 letras: sí o no`;
        const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: firstPrompt,
            },
          ],
        });

        updateCourseTokens(req.body.courseCode, response.usage.prompt_tokens, response.usage.completion_tokens);

        // console.log(response.data.choices[0].message.content)
        if (response.choices[0].message.content.toLowerCase().includes("s")) {
          // console.log('SÍ: ')
          // console.log(response.data.choices[0].message.content)
          GPTResponses.push({ result: "Correcto" });
        } else if (
          response.choices[0].message.content.toLowerCase().includes("n")
        ) {
          // console.log('NO: ')
          // console.log(response.data.choices[0].message.content)
          const response2 = await openai.chat.completions.create({
            model: "gpt-4-0125-preview",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant.",
              },
              {
                role: "user",
                content: firstPrompt,
              },
              {
                role: "assistant",
                content: response.choices[0].message.content,
              },
              {
                role: "user",
                content: "Explica por qué mi respuesta es incorrecta.",
              },
              // ${quiz.studentResponse}
              // ¿La respuesta completa correctamente la actividad de completación?
            ],
          });

          updateCourseTokens(req.body.courseCode, response2.usage.prompt_tokens, response2.usage.completion_tokens);

          // console.log(response2.choices[0].message.content)
          GPTResponses.push({
            result: response2.choices[0].message.content,
          });
        }
        // console.log(GPTResponses)
      }
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: GPTResponses,
      };
    } catch (error) {
      await saveLog(
        `Error creating a quizz for: ${req.body.courseCode}, error ${error.message}`,
        "Error",
        "correctShortAnswerQuiz()",
        "Quiz"
      );
      context.res = {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      if (req.body.operation == "create") {
        if (req.body.quizType == "quizz") {
          await createMultipleChoiceQuiz();
        }
        if (req.body.quizType == "shortAnswer") {
          await createShortAnswerQuiz();
        }
        if (req.body.quizType == "completion") {
          await createCompletionQuiz();
        }
        if (req.body.quizType == "trueOrFalse") {
          await createTrueOrFalseQuiz();
        }
      } else if (req.body.operation == "correct") {
        if (req.body.quizType == "multipleChoice") {
        }
        if (req.body.quizType == "shortAnswer") {
          await correctShortAnswerQuiz();
        }
        if (req.body.quizType == "completion") {
          await correctCompletionQuiz();
        }
      } else if (req.body.operation == "download") {
        const response = await downloadQuiz(
          req.query.courseCode,
          req.query.indexSection,
          req.query.indexElement
        );
        if (response) {
          context.res = {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
            body: { url: response },
          };
        } else {
          context.res = {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              message: "Error",
            },
          };
        }
      }

      break;

    default:
      break;
  }
};

export default httpTrigger;
