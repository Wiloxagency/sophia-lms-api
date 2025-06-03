import { PDFDocument } from "pdf-lib";

export async function splitPdfBinary(
  buffer: Buffer,
  maxSizeBytes = 12 * 1024 * 1024 // 12 MB
): Promise<Buffer[]> {
  const originalDoc = await PDFDocument.load(buffer);
  const totalPages = originalDoc.getPageCount();
  const chunks: Buffer[] = [];

  let start = 0;

  while (start < totalPages) {
    let end = start + 1;
    let lastValidBuffer = Buffer.alloc(0);
    let lastValidEnd = end;

    while (end <= totalPages) {
      const newDoc = await PDFDocument.create();
      const pageIndices = Array.from(
        { length: end - start },
        (_, i) => start + i
      );
      const copiedPages = await newDoc.copyPages(originalDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      if (pdfBuffer.length > maxSizeBytes) {
        if (end - start === 1) {
          // Single page is too large — log and add anyway
          console.warn(
            `⚠️ Single page ${start + 1} exceeds max size (${
              pdfBuffer.length
            } bytes). Adding as-is.`
          );
          chunks.push(pdfBuffer);
          lastValidEnd = end;
        } else if (lastValidBuffer.length > 0) {
          chunks.push(lastValidBuffer);
          console.log(
            `✅ Chunk: pages ${start + 1} to ${lastValidEnd}, size = ${
              lastValidBuffer.length
            } bytes`
          );
        }
        break;
      } else {
        lastValidBuffer = pdfBuffer;
        lastValidEnd = end;
        end++;
      }
    }

    // If reached the end without breaking
    if (lastValidBuffer.length > 0 && lastValidEnd === totalPages) {
      chunks.push(lastValidBuffer);
      console.log(
        `✅ Final chunk: pages ${start + 1} to ${lastValidEnd}, size = ${
          lastValidBuffer.length
        } bytes`
      );
    }

    start = lastValidEnd;
  }

  return chunks;
}