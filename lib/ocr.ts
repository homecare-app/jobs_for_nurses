import { PaddleOcrService } from "ppu-paddle-ocr";

let ocrService: PaddleOcrService | null = null;

/**
 * Initialize the PaddleOCR service (singleton).
 * Downloads models on first run (~15MB cached under ~/.cache/ppu-paddle-ocr).
 */
export async function getOcrService(): Promise<PaddleOcrService> {
  if (!ocrService) {
    ocrService = new PaddleOcrService({
      debugging: { verbose: false },
    });
    await ocrService.initialize();
  }
  return ocrService;
}

/**
 * Extract text from an image buffer using PaddleOCR.
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const service = await getOcrService();
  // Convert Node.js Buffer to ArrayBuffer (ppu-paddle-ocr expects ArrayBuffer | string | canvas)
  const arrayBuf = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const result = await service.recognize(arrayBuf, { flatten: true });

  // `result` is FlattenedPaddleOcrResult when flatten:true
  if ("results" in result) {
    return result.results
      .map((r) => r.text.trim())
      .filter(Boolean)
      .join("\n");
  }
  // Fallback: grouped result
  return result.text;
}

/**
 * Clean up the OCR service (call on server shutdown).
 */
export async function destroyOcrService(): Promise<void> {
  if (ocrService) {
    await ocrService.destroy();
    ocrService = null;
  }
}
