import { createConnection } from "../shared/mongo";
const database = createConnection();

export async function updateCourseTokens(
  courseCode: string,
  tokensToAdd: number
) {

  try {
    const db = await database;

    const Courses = db.collection("course");

    const resp = Courses.findOneAndUpdate(
      { code: courseCode },
      { $inc: { tokensConsumed: tokensToAdd } }
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
