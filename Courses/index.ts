import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { migrateCourse } from "../CreateContent/migrateCourse";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    const courseCode = req.params.courseCode
    const responseMessage = courseCode

    const respMigration = await migrateCourse(courseCode)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {newCode: respMigration}
    };

};

export default httpTrigger;