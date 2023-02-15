import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

const database = createConnection()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const updateImage = async (
        courseCode: string,
        sectionIndex: number,
        elementIndex: number,
        slideIndex: number) => {

        try {
            const db = await database
            const Courses = db.collection('course')
            const resp = Courses.findOneAndUpdate({code: courseCode}, {
                $set: {
                    "sections[sectionIndex].elements[elementIndex]": "URL testing..."
                }
            })

        } catch (error) {

        }
    }

    switch (req.method) {
        case "POST":
            //await createCourse()
            break;

        case "PUT":
            await updateImage(
                req.body.courseCode,
                req.body.sectionIndex,
                req.body.elementIndex,
                req.body.slideIndex)
            break;

        case "GET":
            if (req.params.courseCode) {
                //await getCourse(req.params.courseCode)
            } else {
                //await getCourses()
            }

            break;

        default:
            break;
    }
};

export default httpTrigger;