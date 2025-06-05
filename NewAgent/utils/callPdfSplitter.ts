import { PDFDocument } from "pdf-lib";

export async function callPdfSplitter(
  buffer: Buffer,
  maxSizeBytes = 15 * 1024 * 1024 // 15MB
): Promise<Buffer[]> {
  const originalDoc = await PDFDocument.load(buffer);
  const totalPages = originalDoc.getPageCount();
  const chunks: Buffer[] = [];

  let start = 0;
  let attemptCounter = 0;
  const maxAttempts = 500;

  while (start < totalPages) {
    let end = start + 1;
    let lastGoodBuffer: Buffer | null = null;

    while (end <= totalPages) {
      const newDoc = await PDFDocument.create();
      const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);
      const copiedPages = await newDoc.copyPages(originalDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const chunkBuffer = Buffer.from(await newDoc.save());

      if (chunkBuffer.length > maxSizeBytes) {
        if (end - start === 1) {
          console.warn(`Page ${start + 1} alone exceeds max size, forcing as separate chunk`);
          chunks.push(chunkBuffer);
          start = end;
        } else {
          console.log(`Chunk from page ${start + 1} to ${end - 1} added`);
          chunks.push(lastGoodBuffer!);
          start = end - 1;
        }
        break;
      } else {
        lastGoodBuffer = chunkBuffer;
        if (end === totalPages) {
          console.log(`Final chunk from page ${start + 1} to ${end} added`);
          chunks.push(chunkBuffer);
          start = end;
          break;
        } else {
          end++;
        }
      }

      if (++attemptCounter > maxAttempts) {
        throw new Error("Splitter exceeded maximum iterations — possible infinite loop.");
      }
    }
  }

  return chunks;
}
