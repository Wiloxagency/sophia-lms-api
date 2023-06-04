import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";
import { DocumentCreator } from "../shared/downloadElementAsDoc";
import { v4 as uuidv4 } from "uuid";
import { Packer } from "docx";
import { BlobServiceClient } from "@azure/storage-blob";
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const database = createConnection();

export const downloadQuiz = async (
  courseCode: string,
  indexSection: string,
  indexElement: string
): Promise<string> => {
  try {
    // console.log(req.query)
    const db = await database;
    const Courses = db.collection("course");
    let courseFindOnePromise = Courses.findOne({ code: courseCode });
    let course = await courseFindOnePromise;
    let quiz =
      course.sections[parseInt(indexSection)].elements[parseInt(indexElement)];

    let quizBuffer: Buffer;
    const documentCreatorResponse = new DocumentCreator();
    let quizDocument: any;

    if (quiz.type == "quizz") {
      quizDocument = documentCreatorResponse.createMultipleChoiceQuizDoc([
        quiz.elementQuiz.quizz_list,
      ]);
    }
    if (quiz.type == "shortAnswer") {
      quizDocument = documentCreatorResponse.createShortAnswerQuizDoc([
        quiz.elementQuiz.quizz_list,
      ]);
    }
    if (quiz.type == "completion") {
      quizDocument = documentCreatorResponse.createCompletionQuizDoc([
        quiz.elementQuiz.quizz_list,
      ]);
    }
    if (quiz.type == "trueOrFalse") {
      quizDocument = documentCreatorResponse.createTrueOrFalseQuizDoc([
        quiz.elementQuiz.quizz_list,
      ]);
    }

    await Packer.toBuffer(quizDocument).then((buffer) => {
      // fs.writeFileSync("My Document.docx", buffer);
      quizBuffer = buffer;
    });

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("quizzes");
    const blobName = uuidv4() + ".docx";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(quizBuffer, quizBuffer.length);
    return blockBlobClient.url;
  } catch (error) {
    await saveLog(
      `Error downloading quiz: ${error.message}`,
      "Error",
      "downloadQuiz()",
      "Quiz"
    );
    return undefined;
  }
};
