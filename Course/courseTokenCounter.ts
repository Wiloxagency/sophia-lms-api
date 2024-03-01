import { createConnection } from "../shared/mongo";

const OPENAI_INPUT_TOKEN_COST = parseFloat(process.env.OPENAI_INPUT_TOKEN_COST);

const OPENAI_OUTPUT_TOKEN_COST = parseFloat(
  process.env.OPENAI_OUTPUT_TOKEN_COST
);

const database = createConnection();

export async function updateCourseTokens(
  courseCode: string,
  promptTokens: number,
  completionTokens: number
) {
  try {
    const db = await database;

    const Courses = db.collection("course");

    let promptTokensCost = promptTokens * OPENAI_INPUT_TOKEN_COST;
    let completionTokensCost = completionTokens * OPENAI_OUTPUT_TOKEN_COST;
    let tokenCost = promptTokensCost + completionTokensCost;

    const resp = Courses.findOneAndUpdate(
      { code: courseCode },
      {
        $inc: {
          promptTokens: promptTokens,
          completionTokens: completionTokens,
          tokenCost: tokenCost,
        },
      }
    );
    const body = await resp;

    if (body) {
      return {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      };
    } else {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error updating course tokens",
        },
      };
    }
  } catch (error) {
    return {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Error updating course tokens",
      },
    };
  }
}
