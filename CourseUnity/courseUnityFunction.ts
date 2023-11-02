import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { MongoClient } from "mongodb";

export const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  client: MongoClient
) {
  const createCourse = async () => {
    const createdCourses = parseInt(req.body.createdCourses);

    try {
      const db = client.db();
      const Courses = db.collection("course");
      const resp = Courses.insertOne(req.body.course);

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
            message: "Error creating course",
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
          message: "Error"
        },
      };
    }
  };

  const updateCourse = async (courseCode: string) => {
    delete req.body._id;

    try {
      const db = client.db();
      const Courses = db.collection("course");

      const resp = Courses.findOneAndUpdate(
        { code: courseCode },
        { $set: req.body }
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
            message: "Error updating course by code",
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
          message: "Error updating course by code",
        },
      };
    }
  };

  const getCourse = async (courseCode: string) => {
    try {
      const db = client.db();
      const Courses = db.collection("course");

      const resp = Courses.aggregate([
        {
          $match: {
            code: courseCode,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "author_code",
            foreignField: "code",
            as: "createdBy",
          },
        },
        {
          $addFields: {
            createdBy: "$createdBy.name",
          },
        },
        {
          $unwind: {
            path: "$createdBy",
          },
        },
      ]);

      const body = await resp.toArray();

      if (body && body[0]) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body[0],
        };
      } else {
        return {
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
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error getting course by code",
        },
      };
    }
  };

  const getCourses = async (query: any) => {
    try {
      const db = client.db();
      const collection = db.collection("course");

      const queryOrganizationCode = query.organizationCode
        ? { organizationCode: query.organizationCode }
        : {};
      const queryAuthorCode = query.authorCode
        ? { author_code: query.authorCode }
        : {};

      const regexSearch = new RegExp(query.search, "i"); // "i" indica que a busca é case-insensitive
      const querySearch = {
        $and: [
          queryOrganizationCode,
          queryAuthorCode,
          {
            $or: [
              { code: { $regex: regexSearch } },
              { author_code: { $regex: regexSearch } },
              { "details.title": { $regex: regexSearch } },
              { "details.summary": { $regex: regexSearch } },
            ],
          },
        ],
      };

      const regexData = new RegExp(query.dateCreated, "i");
      const queryData = { dateCreated: { $regex: regexData } };

      const regexStatus = new RegExp(query.approvalStatus, "i");
      const queryStatus = { approvalStatus: { $regex: regexStatus } };

      // const regexCategories = new RegExp(query.categories, "i")
      // const queryCategories = { 'details.categories': { $regex: regexCategories } }

      const skipNum = parseInt(query.skip);
      const limitNum = parseInt(query.items_by_page);

      const body = await collection
        .find(
          Object.assign(
            queryStatus,
            queryData,
            querySearch
            // , queryCategories
          )
        )
        .sort({ _id: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .toArray();

      if (body) {
        return {
          status: 200,
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
            message: "No course found",
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
          message: "Error getting courses",
        },
      };
    }
  };

  const deleteCourse = async () => {
    try {
      const db = client.db();
      const Courses = db.collection("course");

      const resp = Courses.deleteOne({ code: req.params.courseCode });
      const body = await resp;
      if (body) {
        return {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Error deleting course by code",
        },
      };
    }
  };

  switch (req.method) {
    case "POST":
      return await createCourse();

    case "PUT":
      return await updateCourse(req.params.courseCode);

    case "DELETE":
      return await deleteCourse();

    case "GET":
      if (req.params.courseCode) {
        return await getCourse(req.params.courseCode);
      } else {
        return await getCourses(req.query);
      }

    default:
      break;
  }
};

export default httpTrigger;
