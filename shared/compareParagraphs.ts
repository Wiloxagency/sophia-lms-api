import { createConnection } from "./mongo";
const database = createConnection();
export async function cleanParagraphs(objects: any[], sectionCounter: number, lessonCounter: number, courseCode: string): Promise<any[]> {


    const db = await database;
    const Courses = db.collection("course");

    const filteredItems = objects.filter(item =>
        item.content && item.audioScript &&
        item.content.length > 3 &&
        item.audioScript.length > 3
    );

    if (filteredItems.length < objects.length) {
        console.log("El arreglo original necesitó ser modificado.");
        const currentParagraphArrayPath = `sections.${sectionCounter}.elements.${lessonCounter}.elementLesson.paragraphs`;
        await Courses.findOneAndUpdate(
            { code: courseCode },
            {
                $set: {
                    [currentParagraphArrayPath]: filteredItems
                },
            }
        )
        return filteredItems
    } else {
        return objects
    }

}

export function compareObjectStructures(objects: any[]): number {
    // console.info("objects:",
    //     objects.map((ele: any, index) => {
    //         return index + " " + ele.content
    //     })
    // )
    const objMaster: any =
    {
        "content": "",
        "audioScript": "",
        "audioUrl": "",
        "srt": {},
        "titleAI": "",
        "translatedTitleAI": "",
        "imageData": {},
        "videoData": {},
        "keyPhrases": []
    }
    // Helper function to get the structure of an object
    function getStructure(object: any): string {
        return JSON.stringify(Object.keys(object).sort().map(key => ({ key, type: typeof object[key] })));
    }

    // Get the structure of the master object
    const masterStructure = getStructure(objMaster);

    // Iterate over all objects and compare their structure to the master structure
    for (let i = 0; i < objects.length; i++) {
        if (getStructure(objects[i]) !== masterStructure) {
            // console.info("return i:", i)
            // console.info("objects[i]:", objects[i])
            return i;
        }
    }

    // If all objects have the same structure, return -1
    return -1;
}