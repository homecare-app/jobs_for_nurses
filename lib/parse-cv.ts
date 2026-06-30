/**
 * Extracted data from a CV/resume — personal + professional fields.
 */
export interface ExtractedCvData {
  // Personal
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
  extractedLicense?: string;
  extractedAddress?: string;
  extractedDob?: string;
  extractedNationality?: string;
  extractedLanguages?: string;

  // Professional
  extractedExperience?: string;        // summary or years
  extractedEducation?: string;          // degrees + institutions
  extractedSkills?: string;             // comma-separated
  extractedCertifications?: string;     // certifications
  extractedCurrentEmployer?: string;
  extractedPreviousEmployers?: string;

  // Raw full text
  rawText?: string;

  [key: string]: string | undefined;
}

/**
 * Parse raw text extracted from a CV/resume to extract structured fields.
 * Uses regex heuristics — works best on well-structured resumes.
 */
export function parseCvText(rawText: string): ExtractedCvData {
  const result: ExtractedCvData = {};
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  result.rawText = rawText.substring(0, 5000); // store truncated raw text

  // --- Email ---
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) {
      result.extractedEmail = match[0].toLowerCase();
      break;
    }
  }

  // --- Phone (Pakistani/international) ---
  const phoneRegex =
    /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4,}/;
  for (const line of lines) {
    const match = line.match(phoneRegex);
    if (match) {
      let phone = match[0].trim();
      const digits = phone.replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 13) {
        // Normalize Pakistani numbers
        if (digits.startsWith("92") && digits.length === 12) {
          phone =
            "+" +
            digits.substring(0, 2) +
            " " +
            digits.substring(2, 5) +
            " " +
            digits.substring(5);
        } else if (digits.startsWith("0") && digits.length === 11) {
          phone =
            "+92 " +
            digits.substring(2, 5) +
            " " +
            digits.substring(5);
        }
        result.extractedPhone = phone;
        break;
      }
    }
  }

  // --- PNC License Number ---
  const licenseRegex =
    /\b(?:PNC|P\.N\.C|Pakistan Nursing Council)[-:\s]*(?:No[.:]?\s*)?(\d{4,8})\b/i;
  for (const line of lines) {
    const match = line.match(licenseRegex);
    if (match) {
      const digits = match[1] || match[0].replace(/\D/g, "");
      if (digits.length >= 4 && digits.length <= 8) {
        result.extractedLicense = `PNC-${digits}`;
        break;
      }
    }
  }
  if (!result.extractedLicense) {
    for (const line of lines) {
      if (/license|licence|pnc|registration/i.test(line)) {
        const digits = line.replace(/\D/g, "");
        if (digits.length >= 4 && digits.length <= 8) {
          result.extractedLicense = `PNC-${digits}`;
          break;
        }
      }
    }
  }

  // --- Name (heuristic) ---
  const skipPatterns = [
    /^(address|phone|email|license|pnc|name|date|dob|gender|city|country|cnic|qualification|experience|institution|signature|page|form|application|council|registration|certificate|republic|islamabad|pakistan|government|ministry|department|board|hospital|college|university|curriculum|vitae|resume|cv|summary|profile|objective|education|skills|experience|work|employment|references|languages|interests|hobbies)/i,
    /^\d+[\s.]/,
    /^[A-Z\s]{10,}$/,
    /^[a-z]/,
    /^(•|-|\*|✓|□|☐)/,
    /\d{4}[-/]\d{2}[-/]\d{2}/,
    /\b[A-Za-z0-9._%+-]+@/,
    /\+?\d{7,}/,
    /PNC[-:\s]?\d/,
  ];

  // First: lines with "Name:" or "Full Name:"
  for (const line of lines) {
    const nameMatch = line.match(/(?:Name|Full Name|Candidate)[:\s]+(.+)/i);
    if (nameMatch) {
      const potentialName = nameMatch[1].trim();
      if (potentialName.length > 3 && !/\d/.test(potentialName)) {
        result.extractedName = potentialName;
        break;
      }
    }
  }
  // Fallback: first line of file that looks like a name
  if (!result.extractedName) {
    // Usually the first non-trivial line in a resume is the name
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.replace(/^[\d\s.]+/, "").trim();
      if (
        trimmed.length > 3 &&
        trimmed.length < 50 &&
        !skipPatterns.some((p) => p.test(trimmed)) &&
        /^[A-Za-z\s.\-']+$/.test(trimmed) &&
        trimmed.split(/\s+/).length >= 2
      ) {
        result.extractedName = trimmed;
        break;
      }
    }
  }

  // --- Address ---
  const addressPatterns = [
    /address[:\s]+(.+)/i,
    /located at[:\s]+(.+)/i,
    /residence[:\s]+(.+)/i,
  ];
  for (const line of lines) {
    for (const pattern of addressPatterns) {
      const match = line.match(pattern);
      if (match && match[1].trim().length > 5) {
        result.extractedAddress = match[1].trim();
        break;
      }
    }
    if (result.extractedAddress) break;
  }
  // Fallback: lines containing city + country patterns
  if (!result.extractedAddress) {
    const cityKeywords = /karachi|lahore|islamabad|rawalpindi|peshawar|quetta|multan|faisalabad|gujranwala|hyderabad|sialkot/i;
    for (const line of lines) {
      if (cityKeywords.test(line) && /\d{4,5}/.test(line) && line.length > 10) {
        result.extractedAddress = line;
        break;
      }
    }
  }

  // --- DOB ---
  const dobRegex = /\b(?:DOB|Date of Birth|Birth Date|Born)[:\s]+(.+?)(?:\n|$)/i;
  const dobMatch = rawText.match(dobRegex);
  if (dobMatch) {
    const dob = dobMatch[1].trim();
    if (dob.length > 3 && /\d/.test(dob)) {
      result.extractedDob = dob;
    }
  }

  // --- Nationality ---
  const nationalityRegex = /\b(?:Nationality|Citizenship)[:\s]+(.+?)(?:\n|$)/i;
  const natMatch = rawText.match(nationalityRegex);
  if (natMatch) {
    const nat = natMatch[1].trim();
    if (nat.length > 2 && nat.length < 50) {
      result.extractedNationality = nat;
    }
  }

  // --- Languages ---
  const langSection = extractSection(rawText, [
    /languages?/i,
    /linguistic/i,
  ]);
  if (langSection) {
    result.extractedLanguages = langSection
      .split("\n")
      .map((l) => l.replace(/^[•\-*\d.\s]+/, "").trim())
      .filter((l) => l.length > 0 && !/^(languages?|linguistic)/i.test(l))
      .slice(0, 8)
      .join(", ");
  }

  // --- Education ---
  const eduSection = extractSection(rawText, [
    /education/i,
    /academic background/i,
    /qualifications?/i,
    /training/i,
  ]);
  if (eduSection) {
    // Extract degree + institution pairs
    const eduLines = eduSection
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const significant = eduLines
      .filter((l) => {
        const lower = l.toLowerCase();
        return (
          /\b(bsn|msn|rn|diploma|bachelor|master|degree|university|college|institute|school|phd|dnp|bs|ma|ms|bba|mba|bsc|msc)\b/i.test(
            lower
          ) && !/^(education|qualification|training)/i.test(lower)
        );
      })
      .slice(0, 5);
    if (significant.length > 0) {
      result.extractedEducation = significant.join("; ");
    }
  }

  // --- Experience ---
  const expSection = extractSection(rawText, [
    /(?:work\s+)?experience/i,
    /employment/i,
    /professional\s+background/i,
    /career/i,
  ]);
  if (expSection) {
    const expLines = expSection
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const significant = expLines
      .filter((l) => {
        const lower = l.toLowerCase();
        return (
          l.length > 15 &&
          !/^(experience|work|employment|professional)/i.test(lower) &&
          !/^(•|-|\*)/.test(l)
        );
      })
      .slice(0, 8);
    if (significant.length > 0) {
      result.extractedExperience = significant.join("; ");
    }
  }

  // --- Skills ---
  const skillsSection = extractSection(rawText, [
    /skills?/i,
    /competenc/i,
    /proficienc/i,
    /expertise/i,
  ]);
  if (skillsSection) {
    const skillLines = skillsSection
      .split("\n")
      .map((l) =>
        l
          .replace(/^[•\-*\d.\s]+/, "")
          .replace(/\s*\(.*?\)\s*/g, "")
          .trim()
      )
      .filter((l) => l.length > 2 && !/^skills?$/i.test(l))
      .slice(0, 20);

    if (skillLines.length > 0) {
      // Join as comma-separated, or keep as semicolon if multi-word per line
      result.extractedSkills = skillLines.join(", ");
    }
  }

  // --- Certifications ---
  const certSection = extractSection(rawText, [
    /certificat/i,
    /licens/i,
    /credential/i,
    /professional\s+membership/i,
  ]);
  if (certSection) {
    const certLines = certSection
      .split("\n")
      .map((l) =>
        l
          .replace(/^[•\-*\d.\s]+/, "")
          .trim()
      )
      .filter(
        (l) =>
          l.length > 5 &&
          !/^certificat/i.test(l) &&
          !/^license/i.test(l)
      )
      .slice(0, 8);

    // Don't duplicate PNC license
    if (certLines.length > 0) {
      const filtered = certLines.filter(
        (c) => !result.extractedLicense || !c.includes("PNC")
      );
      if (filtered.length > 0) {
        result.extractedCertifications = filtered.join("; ");
      }
    }
  }

  // --- Current Employer ---
  // Look within first few lines of experience section
  if (expSection) {
    const expLines = expSection.split("\n").filter(Boolean);
    // Usually employer is the first substantive line after "Experience" header
    for (const line of expLines.slice(0, 5)) {
      const trimmed = line.replace(/^[•\-*\d.\s]+/, "").trim();
      if (
        trimmed.length > 10 &&
        !/^(experience|work)/i.test(trimmed) &&
        /[A-Z]/.test(trimmed) &&
        /\d{4}/.test(trimmed)
      ) {
        result.extractedCurrentEmployer = trimmed;
        break;
      }
    }
  }

  return result;
}

/**
 * Extract a section of text between a header keyword and the next section header.
 * Looks for lines matching `patterns`, then collects lines until the next
 * likely section boundary.
 */
function extractSection(
  text: string,
  patterns: RegExp[]
): string | null {
  const lines = text.split("\n");
  let startIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (patterns.some((p) => p.test(line))) {
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx === -1 || startIdx >= lines.length) return null;

  // Section boundaries: next ALL-CAPS header, or next "Education/Experience/Skills/etc."
  const sectionHeaders = /^(education|experience|skills?|certification|references|training|projects|publications|awards|languages|interests|volunteer|summary|objective|profile)$/i;

  const sectionLines: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    // Stop at next section header (short, capitalized, or known keyword)
    if (
      line.length > 0 &&
      line.length < 60 &&
      (sectionHeaders.test(line) ||
        (/^[A-Z\s]{4,}$/.test(line) && line.length > 3))
    ) {
      // But only if it looks like a header (not just a long word)
      if (patterns.some((p) => p.test(line))) continue; // skip same section name
      break;
    }
    sectionLines.push(line);
  }

  const result = sectionLines.filter(Boolean).join("\n").trim();
  return result.length > 0 ? result : null;
}
