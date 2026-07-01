export interface ExtractedData {
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
  extractedLicense?: string;
  [key: string]: string | undefined;
}

/**
 * Parse raw OCR text to extract candidate fields:
 * - Name (heuristic: first substantive line or text near "Name:" label)
 * - Phone number (Pakistani/international formats)
 * - Email address
 * - PNC License number
 */
export function parseOcrText(rawText: string): ExtractedData {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result: ExtractedData = {};

  // --- Email ---
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) {
      result.extractedEmail = match[0].toLowerCase();
      break;
    }
  }

  // --- Phone (Pakistani: +92 3XX XXXXXXX or variants) ---
  const phoneRegex =
    /(?:\+?92[\s-]?|0)(?:3\d{2})[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{3}|\+?92[\s-]?\d{10}|\b0\d{10}\b|\+92\s\d{3}\s\d{7,8}/;
  for (const line of lines) {
    const cleaned = line.replace(/[-\s]/g, "");
    // Try to find Pakistani mobile numbers
    const match = line.match(phoneRegex);
    if (match) {
      let phone = match[0].trim();
      // Normalize: ensure it starts with +92
      const digits = phone.replace(/\D/g, "");
      if (digits.length === 10 && digits.startsWith("3")) {
        phone = "+92 " + digits.substring(0, 3) + " " + digits.substring(3);
      } else if (digits.length === 12 && digits.startsWith("92")) {
        phone =
          "+" +
          digits.substring(0, 2) +
          " " +
          digits.substring(2, 5) +
          " " +
          digits.substring(5);
      } else if (digits.length === 11 && digits.startsWith("03")) {
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

  // --- PNC License number ---
  const licenseRegex =
    /\b(?:PNC|P\.N\.C)[-:\s]*\d{4,6}\b|\b\d{4,6}[-:\s]?(?:PNC|P\.N\.C)\b/i;
  for (const line of lines) {
    const match = line.match(licenseRegex);
    if (match) {
      // Clean up to standard format
      const cleaned = match[0].replace(/[.\s]/g, "").toUpperCase();
      const digits = cleaned.replace(/\D/g, "");
      if (digits) {
        result.extractedLicense = `PNC-${digits}`;
      } else {
        result.extractedLicense = match[0].trim();
      }
      break;
    }
  }

  // Also try to find license number on lines with "License" or "PNC" keywords
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
  // Skip lines that look like labels, headers, or already-matched fields
  const skipPatterns = [
    /^(address|phone|email|license|pnc|name|date|dob|gender|city|country|cnic|qualification|experience|institution|signature|page|form|application|council|registration|certificate|republic|islamabad|pakistan|government|ministry|department|board|hospital|college|university)/i,
    /^\d+[\s.]/, // numbered items
    /^[A-Z\s]{10,}$/, // ALL CAPS (likely headers)
    /^[a-z]/, // starts lowercase (unlikely name)
    /^(•|-|\*|✓|□|☐)/, // bullet points
    /\d{4}[-/]\d{2}[-/]\d{2}/, // dates
    /\b[A-Za-z0-9._%+-]+@/, // already extracted email
    /\+?92/, // already extracted phone
    /PNC[-:\s]?\d/, // already extracted license
  ];

  // First: try lines that explicitly say "Name:"
  for (const line of lines) {
    const nameMatch = line.match(/(?:Name|Full Name|Candidate)[:\s]+(.+)/i);
    if (nameMatch) {
      const potentialName = nameMatch[1].trim();
      if (potentialName.length > 3 && !/\d/.test(potentialName)) {
        result.extractedName = capitalizeName(potentialName);
        break;
      }
    }
  }

  // Fallback: first non-skipped line of reasonable length
  if (!result.extractedName) {
    for (const line of lines) {
      const trimmed = line.replace(/^[\d\s.]+/, "").trim();
      if (
        trimmed.length > 4 &&
        trimmed.length < 50 &&
        !skipPatterns.some((p) => p.test(trimmed)) &&
        /^[A-Za-z\s.\-']+$/.test(trimmed) && // only alphabetic chars
        trimmed.split(/\s+/).length >= 2 // at least 2 words
      ) {
        result.extractedName = capitalizeName(trimmed);
        break;
      }
    }
  }

  return result;
}

function capitalizeName(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return word;
      // Handle hyphenated names like "Ahmed-Khan"
      return word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("-");
    })
    .join(" ");
}
