import { PDFDocument } from "pdf-lib";

/**
 * Quickly checks if the PDF exceeds the size limit per allowed chunk.
 * Stops at the first chunk that would exceed `maxSizeBytes`.
 */
export async function requiresSplit(
  buffer: Buffer,
  maxSizeBytes = 15 * 1024 * 1024 // 15 MB
): Promise<boolean> {
  const originalDoc = await PDFDocument.load(buffer);
  const totalPages = originalDoc.getPageCount();

  let start = 0;

  while (start < totalPages) {
    let end = start + 1;

    while (end <= totalPages) {
      const newDoc = await PDFDocument.create();
      const pageIndices = Array.from(
        { length: end - start },
        (_, i) => start + i
      );
      const copiedPages = await newDoc.copyPages(originalDoc, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const pdfBuffer = Buffer.from(await newDoc.save());

      if (pdfBuffer.length > maxSizeBytes) {
        if (end - start === 1) {
          // Single page exceeds the limit
          return true;
        } else {
          // Multiple pages exceed the limit
          return true;
        }
      } else {
        end++;
      }
    }

    // Move to next untested page range
    start = end - 1;
  }

  return false;
}
