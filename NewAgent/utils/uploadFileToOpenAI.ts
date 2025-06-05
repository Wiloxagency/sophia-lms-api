import fs from "fs";
import OpenAI from "openai";
import type { FileObject } from "openai/resources/files";
import { callPdfSplitter } from "./callPdfSplitter";
import { requiresSplit } from "./requiresSplit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function uploadFileToOpenAI(
  filePath: string
): Promise<FileObject[]> {
  const buffer = fs.readFileSync(filePath);
  const uploads: FileObject[] = [];

  let chunks: Buffer[];

  if (await requiresSplit(buffer)) {
    console.warn(`PDF needs splitting. Sending to splitter service...`);
    chunks = await callPdfSplitter(buffer);
  } else {
    chunks = [buffer];
  }

  for (let i = 0; i < chunks.length; i++) {
    const tempPath = `${filePath}-chunk-${i}.pdf`;
    fs.writeFileSync(tempPath, chunks[i]);

    const stream = fs.createReadStream(tempPath);
    const uploaded = await client.files.create({
      file: stream,
      purpose: "assistants",
    });

    uploads.push(uploaded);
    fs.unlinkSync(tempPath);
  }

  return uploads;
}
