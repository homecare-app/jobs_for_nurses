import { describe, it, expect } from 'vitest';
import { parseOcrText, ExtractedData } from '../lib/parse-ocr.js';

describe('parseOcrText', () => {
  describe('email extraction', () => {
    it('extracts email from labeled line', () => {
      const result = parseOcrText('Email: nurse@example.com\nPhone: +92 300 1234567');
      expect(result.extractedEmail).toBe('nurse@example.com');
    });

    it('extracts email from plain text', () => {
      const result = parseOcrText('Contact me at nurse.test@hospital.pk');
      expect(result.extractedEmail).toBe('nurse.test@hospital.pk');
    });

    it('lowercases extracted email', () => {
      const result = parseOcrText('EMAIL: Nurse@Example.COM');
      expect(result.extractedEmail).toBe('nurse@example.com');
    });

    it('returns undefined when no email present', () => {
      const result = parseOcrText('No contact information here');
      expect(result.extractedEmail).toBeUndefined();
    });
  });

  describe('phone extraction', () => {
    it('extracts +92 format Pakistani mobile', () => {
      const result = parseOcrText('Phone: +92 300 1234567');
      expect(result.extractedPhone).toContain('+92');
    });

    it('extracts 03xx format Pakistani mobile', () => {
      const result = parseOcrText('Contact: 0300 1234567');
      expect(result.extractedPhone).toContain('+92');
    });

    it('extracts 92xx format', () => {
      const result = parseOcrText('Tel: 923001234567');
      expect(result.extractedPhone).toContain('+92');
    });

    it('returns undefined when no phone present', () => {
      const result = parseOcrText('Just an email@test.com here');
      expect(result.extractedPhone).toBeUndefined();
    });
  });

  describe('PNC license extraction', () => {
    it('extracts PNC-XXXXX format', () => {
      const result = parseOcrText('PNC License: PNC-12345');
      expect(result.extractedLicense).toBe('PNC-12345');
    });

    it('extracts P.N.C format', () => {
      const result = parseOcrText('Reg: P.N.C-67890');
      expect(result.extractedLicense).toContain('67890');
    });

    it('falls back to keyword + digits', () => {
      const result = parseOcrText('License registration number is 54321');
      expect(result.extractedLicense).toBe('PNC-54321');
    });
  });

  describe('name extraction', () => {
    it('extracts name from Name: label', () => {
      const result = parseOcrText('Name: Fatima Khan\nEmail: f@test.com');
      expect(result.extractedName).toContain('Fatima');
    });

    it('extracts name from Full Name: label', () => {
      const result = parseOcrText('Full Name: Ahmed Ali');
      expect(result.extractedName).toContain('Ahmed');
    });

    it('falls back to first substantive line', () => {
      const text = [
        'PAKISTAN NURSING COUNCIL',
        'Registration Certificate',
        'Sarah Ahmed',
        'Phone: +92 300 1234567'
      ].join('\n');
      const result = parseOcrText(text);
      expect(result.extractedName).toContain('Sarah');
    });

    it('skips header lines in ALL CAPS', () => {
      const text = [
        'CURRICULUM VITAE',
        'Muhammad Usman',
        'Karachi, Pakistan'
      ].join('\n');
      const result = parseOcrText(text);
      expect(result.extractedName).toContain('Usman');
    });

    it('returns undefined for empty text', () => {
      const result = parseOcrText('');
      expect(result.extractedName).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles completely empty input', () => {
      const result = parseOcrText('');
      expect(result).toEqual({});
    });

    it('handles gibberish input gracefully', () => {
      const result = parseOcrText('!@#$%^&*() 12345 abcdef');
      expect(result.extractedName).toBeUndefined();
      expect(result.extractedEmail).toBeUndefined();
    });

    it('returns all extracted fields together', () => {
      const text = [
        'Name: Ayesha Khan',
        'Email: ayesha@nurse.pk',
        'Phone: +92 321 9876543',
        'PNC: PNC-98765'
      ].join('\n');
      const result = parseOcrText(text);
      expect(result.extractedName).toContain('Ayesha');
      expect(result.extractedEmail).toBe('ayesha@nurse.pk');
      expect(result.extractedPhone).toBeDefined();
      expect(result.extractedLicense).toContain('98765');
    });
  });
});
