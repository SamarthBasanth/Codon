import * as pdfjs from "pdfjs-dist";

// Serve the worker from our own origin (bundler emits it as an asset) so there
// are no CSP / cross-origin issues.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * Extract the text layer from a PDF, in the browser. Returns concatenated page
 * text (capped at 40 pages) suitable for feeding into the Preflight engine.
 * Note: scanned/image-only PDFs have no text layer and will return little.
 */
export async function extractPdfText(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  const maxPages = Math.min(pdf.numPages, 40);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => (typeof (it as { str?: unknown }).str === "string" ? (it as { str: string }).str : ""))
      .join(" ");
    parts.push(line);
  }
  return parts.join("\n\n").replace(/[ \t]+/g, " ").trim();
}
