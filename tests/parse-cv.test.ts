import { describe, it, expect } from 'vitest';
import { parseCvText, ExtractedCvData } from '../lib/parse-cv.js';

const MOCK_CV = [
  'CURRICULUM VITAE',
  '',
  'Fatima Zaidi',
  'Registered Nurse',
  '',
  'Email: fatima.zaidi@example.com',
  'Phone: +92 300 1234567',
  'PNC License: PNC-87654',
  '',
  'Address: House 12, Street 5, Gulshan-e-Maymar, Karachi',
  'DOB: 15-03-1990',
  'Nationality: Pakistani',
  'Languages',
'English, Urdu, Sindhi',
  '',
  'EDUCATION',
  'BSN from Aga Khan University, Karachi (2012)',
  'Diploma in General Nursing from Sindh Nursing School (2010)',
  '',
  'EXPERIENCE',
  'Aga Khan University Hospital, Karachi — Senior Staff Nurse (2015-2023)',
  'Liaquat National Hospital — Staff Nurse (2012-2015)',
  '',
  'SKILLS',
  'ICU patient monitoring, Wound care, IV therapy, Ventilator management',
  'EMR systems: Epic, Cerner',
  '',
  'CERTIFICATIONS',
  'BLS (American Heart Association)',
  'ACLS (2023)',
  '',
  'REFERENCES',
  'Available upon request'
].join('\n');

describe('parseCvText', () => {
  it('extracts email from CV text', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedEmail).toBe('fatima.zaidi@example.com');
  });

  it('extracts phone from CV text', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedPhone).toBeDefined();
    expect(result.extractedPhone).toContain('+92');
  });

  it('extracts PNC license from CV text', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedLicense).toContain('87654');
  });

  it('extracts name from CV', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedName).toContain('Fatima');
  });

  it('extracts address from labeled line', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedAddress).toContain('Karachi');
  });

  it('extracts DOB from labeled line', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedDob).toContain('15-03-1990');
  });

  it('extracts nationality', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedNationality).toBe('Pakistani');
  });

  it('extracts languages', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedLanguages).toContain('English');
    expect(result.extractedLanguages).toContain('Urdu');
  });

  it('extracts education section content', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedEducation).toContain('Aga Khan University');
    expect(result.extractedEducation).toContain('Sindh Nursing');
  });

  it('extracts experience section content', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedExperience).toContain('Aga Khan University Hospital');
    expect(result.extractedExperience).toContain('Liaquat National');
  });

  it('extracts skills as comma-separated', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedSkills).toContain('ICU');
    expect(result.extractedSkills).toContain('Wound care');
  });

  it('extracts certifications', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedCertifications).toContain('BLS');
  });

  it('extracts current employer from experience section', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.extractedCurrentEmployer).toContain('Aga Khan');
  });

  it('stores raw text (truncated)', () => {
    const result = parseCvText(MOCK_CV);
    expect(result.rawText).toBeDefined();
    expect(result.rawText!.length).toBeLessThanOrEqual(5000);
  });

  it('returns empty fields for empty input', () => {
    const result = parseCvText('');
    expect(result.extractedName).toBeUndefined();
    expect(result.extractedEmail).toBeUndefined();
  });

  it('handles minimal CV with no sections', () => {
    const result = parseCvText('John Doe\njohn@test.com');
    expect(result.extractedName).toContain('John');
    expect(result.extractedEmail).toBe('john@test.com');
  });
});
