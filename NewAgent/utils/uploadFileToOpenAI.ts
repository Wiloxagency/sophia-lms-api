import OpenAI from "openai";
import fs from "fs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function uploadFileToOpenAI(filePath: string) {
  const stream = fs.createReadStream(filePath);
  return await client.files.create({ file: stream, purpose: "assistants" });
}
