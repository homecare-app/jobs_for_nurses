import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextFromCv } from '../lib/extract-cv.js';

// Mock ocr module
vi.mock('../lib/ocr.js', () => ({
  extractTextFromImage: vi.fn(async (buf: Buffer) => 'OCR extracted text from image'),
}));

// Mock pdf-parse
vi.mock('pdf-parse', () => {
  const MockPDFParse = vi.fn(function () {
    this.getText = vi.fn().mockResolvedValue({ text: 'PDF extracted text content' });
    this.destroy = vi.fn();
  });
  return {
    PDFParse: MockPDFParse,
    VerbosityLevel: { ERRORS: 0 },
  };
});

// Mock mammoth
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn().mockResolvedValue({ value: 'DOCX extracted text content' }),
  },
}));

// Helper to create buffer from string
function stringToBuffer(str: string): Buffer {
  return Buffer.from(str, 'utf-8');
}

describe('extractTextFromCv file type detection', () => {
  describe('isPdf detection via magic bytes', () => {
    it('routes PDF buffer to PDF extraction', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4...', 'utf-8');
      const result = await extractTextFromCv(pdfBuffer);
      expect(result.sourceType).toBe('pdf');
      expect(result.text).toContain('PDF extracted');
    });
  });

  describe('isDocx detection via ZIP header', () => {
    it('routes DOCX buffer (PK header) to DOCX extraction', async () => {
      // PK\x03\x04 is the ZIP/DOCX header
      const docxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, ...Buffer.from('docx content')]);
      const result = await extractTextFromCv(docxBuffer);
      expect(result.sourceType).toBe('docx');
      expect(result.text).toContain('DOCX extracted');
    });
  });

  describe('image detection', () => {
    it('routes PNG buffer to OCR extraction', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const result = await extractTextFromCv(pngBuffer);
      expect(result.sourceType).toBe('image');
      expect(result.text).toContain('OCR extracted');
    });

    it('routes JPEG buffer to OCR extraction', async () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = await extractTextFromCv(jpegBuffer);
      expect(result.sourceType).toBe('image');
    });
  });

  describe('MIME fallback', () => {
    it('uses MIME type when magic bytes are ambiguous', async () => {
      const buf = stringToBuffer('Some text content');
      const result = await extractTextFromCv(buf, 'application/pdf');
      expect(result.sourceType).toBe('pdf');
    });

    it('uses MIME type for DOCX when magic bytes are ambiguous', async () => {
      const buf = stringToBuffer('Some text');
      const result = await extractTextFromCv(buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(result.sourceType).toBe('docx');
    });
  });

  describe('last resort fallback', () => {
    it('tries PDF then DOCX then image as last resort', async () => {
      const buf = stringToBuffer('Unknown format content');
      // Should try PDF first (will fail because no magic bytes),
      // then DOCX (will fail), then image (last resort)
      const result = await extractTextFromCv(buf, 'application/octet-stream');
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
    });
  });
});
