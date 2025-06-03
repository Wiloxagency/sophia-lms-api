import OpenAI from "openai";
import fs from "fs";
import { splitPdfBinary } from "./splitPdf";
import type { FileObject } from "openai/resources/files";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function uploadFileToOpenAI(
  filePath: string
): Promise<FileObject[]> {
  const buffer = fs.readFileSync(filePath);
  const chunks = await splitPdfBinary(buffer);

  if (chunks.length > 1) {
    console.warn(
      `❌ PDF needs splitting (produces ${chunks.length} chunks). Skipping upload.`
    );
    return [];
  }

  const uploads: FileObject[] = [];

  const tempChunkPath = `${filePath}-chunk-0.pdf`;
  fs.writeFileSync(tempChunkPath, chunks[0]);
  const stream = fs.createReadStream(tempChunkPath);
  const uploaded = await client.files.create({
    file: stream,
    purpose: "assistants",
  });
  uploads.push(uploaded);
  fs.unlinkSync(tempChunkPath);

  return uploads;
}
