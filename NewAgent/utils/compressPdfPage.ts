import { PDFDocument } from "pdf-lib";

export async function compressSinglePdfPage(
  buffer: Buffer,
  pageIndex: number,
  maxSizeBytes: number
): Promise<Buffer | null> {
  const originalPdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();

  const [copiedPage] = await newPdf.copyPages(originalPdf, [pageIndex]);
  newPdf.addPage(copiedPage);

  const compressed = await newPdf.save({ useObjectStreams: true });

  if (compressed.length > maxSizeBytes) {
    console.warn(`Page ${pageIndex + 1} exceeds size limit — skipping.`);
    return null; // skip this page
  }

  return Buffer.from(compressed);
}
