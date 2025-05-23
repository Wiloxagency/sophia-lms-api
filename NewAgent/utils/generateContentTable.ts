import OpenAI from "openai";
import { CourseData } from "../../shared/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateContentTable(
  fileId: string,
  course: CourseData,
  languageName: string,
  maxSections: string
): Promise<string[]> {
  const prompt = `Analyze the attached document and create a table of contents based on its content. Write it in ${languageName}, with exactly ${maxSections} items. This table of contents belongs to a course called: "${course.details.title}". If helpful, consider the course description:\n"${course.details.summary}".\nThe first item should be the introduction of the course and the last item should be the conclusion.\nwrite that table of contents in the following format:\n\n1. Introduction.\n2. Item 2.\n3. Item 3.\n...\n${maxSections}. Conclusion.\n\nDon't write any text before the introduction (item 1) and after the Conclusion (item ${maxSections}) only write the content table without any additional description.`;

  const response = await client.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "user",
        content: [
          { type: "input_file", file_id: fileId },
          { type: "input_text", text: prompt },
        ],
      },
    ],
  });

  const output = response.output_text;
  return output.split("\n").filter((line) => line.trim());
}
