import { extractTextFromImage } from "./ocr.js";

// Dynamically import to avoid ESM/CJS issues
let pdfParseModule: any = null;
async function getPdfParse() {
  if (!pdfParseModule) {
    pdfParseModule = await import("pdf-parse");
  }
  return pdfParseModule;
}

let mammothModule: any = null;
async function getMammoth() {
  if (!mammothModule) {
    mammothModule = await import("mammoth");
  }
  return mammothModule.default || mammothModule;
}

/**
 * Detect if the buffer is a PDF by checking magic bytes (%PDF).
 */
function isPdf(buffer: Buffer): boolean {
  return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
}

/**
 * Detect if the buffer is a DOCX (ZIP archive with "PK" header).
 */
function isDocx(buffer: Buffer): boolean {
  return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

/**
 * Detect if the buffer is a PNG image.
 */
function isPng(buffer: Buffer): boolean {
  return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
}

/**
 * Detect if the buffer is a JPEG image.
 */
function isJpeg(buffer: Buffer): boolean {
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

/**
 * Extract text from a CV/resume buffer by auto-detecting file type.
 * Supports: PDF, DOCX, PNG, JPEG.
 */
export async function extractTextFromCv(
  buffer: Buffer,
  mimeType?: string
): Promise<{ text: string; sourceType: string }> {
  // Try detection by magic bytes first (most reliable)
  if (isPdf(buffer)) {
    return extractPdfText(buffer);
  }
  if (isDocx(buffer)) {
    return extractDocxText(buffer);
  }
  if (isPng(buffer) || isJpeg(buffer)) {
    const text = await extractTextFromImage(buffer);
    return { text, sourceType: "image" };
  }

  // Fallback: MIME type
  if (mimeType) {
    if (mimeType === "application/pdf") {
      return extractPdfText(buffer);
    }
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      return extractDocxText(buffer);
    }
    if (mimeType.startsWith("image/")) {
      const text = await extractTextFromImage(buffer);
      return { text, sourceType: "image" };
    }
  }

  // Last resort: try PDF (most common for CVs), then DOCX, then image
  try {
    return await extractPdfText(buffer);
  } catch {
    try {
      return await extractDocxText(buffer);
    } catch {
      const text = await extractTextFromImage(buffer);
      return { text, sourceType: "image" };
    }
  }
}

async function extractPdfText(buffer: Buffer): Promise<{ text: string; sourceType: string }> {
  const mod = await getPdfParse();
  const { PDFParse, VerbosityLevel } = mod;
  const parser = new PDFParse({
    verbosity: VerbosityLevel.ERRORS,
    data: new Uint8Array(buffer),
  });
  const result = await parser.getText();
  const text = result.text || "";
  parser.destroy();
  return { text, sourceType: "pdf" };
}

async function extractDocxText(buffer: Buffer): Promise<{ text: string; sourceType: string }> {
  const mammoth = await getMammoth();
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value || "", sourceType: "docx" };
}
