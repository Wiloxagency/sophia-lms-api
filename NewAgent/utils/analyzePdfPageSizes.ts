import { PDFDocument } from "pdf-lib";

export async function analyzePdfPageSizes(buffer: Buffer) {
  const originalDoc = await PDFDocument.load(buffer);
  const totalPages = originalDoc.getPageCount();
  console.log(`Total pages: ${totalPages}`);

  const pageSizes: { page: number; size: number }[] = [];

  for (let i = 0; i < totalPages; i++) {
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(originalDoc, [i]);
    singlePageDoc.addPage(copiedPage);

    const singlePageBytes = await singlePageDoc.save();
    const singlePageBuffer = Buffer.from(singlePageBytes);
    pageSizes.push({ page: i + 1, size: singlePageBuffer.length });
  }

  pageSizes.forEach(({ page, size }) => {
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    console.log(
      `📄 Page ${page}: ${size.toLocaleString()} bytes (~${sizeMB} MB)`
    );
  });

  const biggest = [...pageSizes].sort((a, b) => b.size - a.size).slice(0, 5);
  console.log("\n🔥 Top 5 largest pages:");
  biggest.forEach(({ page, size }) => {
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    console.log(
      `→ Page ${page}: ${size.toLocaleString()} bytes (~${sizeMB} MB)`
    );
  });
}
