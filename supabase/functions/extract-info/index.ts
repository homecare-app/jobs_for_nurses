const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 1;

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
};

function extractViaRegex(text: string): Record<string, string> {
  const data: Record<string, string> = {};

  const nameMatch = text.match(/(?:Name|name|Candidate|Nurse|Dr\.)\s*:\s*([A-Za-z\s.]+)/);
  if (nameMatch) data.extractedName = nameMatch[1].trim();
  else {
    const drMatch = text.match(/(Dr\.\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (drMatch) data.extractedName = drMatch[1].trim();
  }

  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) data.extractedEmail = emailMatch[1].trim();

  const phoneMatch = text.match(/(?:\+92|0|92)?[\s-]?3\d{2}[\s-]?\d{7}/);
  if (phoneMatch) {
    let phone = phoneMatch[0].replace(/\s+/g, "").replace(/-/g, "");
    if (phone.startsWith("0")) phone = "+92" + phone.substring(1);
    else if (phone.startsWith("92") && !phone.startsWith("+92")) phone = "+" + phone;
    else if (!phone.startsWith("+")) phone = "+92" + phone;
    if (phone.startsWith("+92") && phone.length >= 12) {
      data.extractedPhone = "+92 " + phone.substring(3, 6) + " " + phone.substring(6);
    } else {
      data.extractedPhone = phone;
    }
  } else {
    const anyPhone = text.match(/(\+\d{1,3}[\s-]?\d{8,12})/);
    if (anyPhone) data.extractedPhone = anyPhone[1].trim();
  }

  const pncMatch = text.match(/(?:PNC|Pnc|pnc)[\s-]*(\d{4,10})/);
  if (pncMatch) data.extractedLicense = "PNC-" + pncMatch[1];
  else {
    const licMatch = text.match(/(?:License|Licence|license|licence)\s*:\s*([A-Za-z0-9-]+)/i);
    if (licMatch) data.extractedLicense = licMatch[1].trim();
  }

  const addrMatch = text.match(/(?:Address|address)\s*:\s*(.+)/);
  if (addrMatch) data.extractedAddress = addrMatch[1].trim();

  const langMatch = text.match(/(?:Languages|languages)\s*:\s*(.+)/);
  if (langMatch) data.extractedLanguages = langMatch[1].trim();

  const eduMatch = text.match(/(?:Education|Qualification|qualification|education)\s*:\s*(.+)/);
  if (eduMatch) data.extractedEducation = eduMatch[1].trim();

  const expMatch = text.match(/(?:Experience|experience)\s*:\s*(.+)/);
  if (expMatch) data.extractedExperience = expMatch[1].trim();

  const skillsMatch = text.match(/(?:Skills|skills)\s*:\s*(.+)/);
  if (skillsMatch) data.extractedSkills = skillsMatch[1].trim();

  const certMatch = text.match(/(?:Certifications|certifications)\s*:\s*(.+)/);
  if (certMatch) data.extractedCertifications = certMatch[1].trim();

  return data;
}

function fileToBase64(file: File): string {
  const bytes = new Uint8Array(file.size);
  // Read file into Uint8Array via FileReader-compatible approach in Deno
  const reader = new FileReaderSync();
  const buffer = reader.readAsArrayBuffer(file);
  const uint8 = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function getMimeType(fileName: string): string {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function isImage(mime: string): boolean {
  return mime.startsWith("image/");
}

function isPdf(mime: string): boolean {
  return mime === "application/pdf";
}

function isTextFile(fileName: string): boolean {
  const name = fileName.toLowerCase();
  return name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".json") || name.endsWith(".md");
}

const GEMINI_INSTRUCTION = `You are extracting information from a nursing CV/resume or PNC license document.
Extract the following fields and return them as a JSON object.
Use these exact keys: name, email, phone, pnc_license_number, address, languages, education, experience, skills, certifications.
If a field is not found, omit it from the JSON.
Return ONLY valid JSON with no markdown formatting.`;

async function callGemini(file: File): Promise<Record<string, string> | null> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return null;

  const mimeType = getMimeType(file.name);

  let parts: Array<Record<string, unknown>>;

  if (isTextFile(file.name)) {
    const text = await file.text();
    parts = [{ text: GEMINI_INSTRUCTION + "\n\nDocument content:\n" + text }];
  } else if (isImage(mimeType) || isPdf(mimeType)) {
    const base64 = fileToBase64(file);
    parts = [
      { text: GEMINI_INSTRUCTION },
      { inline_data: { mime_type: mimeType, data: base64 } },
    ];
  } else {
    return null;
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Gemini API error (${res.status}): ${errText}`);
        if (attempt < MAX_RETRIES) continue;
        return null;
      }

      const result = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        if (attempt < MAX_RETRIES) continue;
        return null;
      }

      // Try to extract JSON from response (handle markdown-wrapped JSON)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        if (attempt < MAX_RETRIES) continue;
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const mapped: Record<string, string> = {};
      if (parsed.name) mapped.extractedName = String(parsed.name);
      if (parsed.email) mapped.extractedEmail = String(parsed.email);
      if (parsed.phone) {
        let p = String(parsed.phone).replace(/\s+/g, "");
        if (p.startsWith("0")) p = "+92" + p.substring(1);
        else if (p.startsWith("92") && !p.startsWith("+92")) p = "+" + p;
        else if (!p.startsWith("+")) p = "+92" + p;
        if (p.startsWith("+92") && p.length >= 12) {
          mapped.extractedPhone = "+92 " + p.substring(3, 6) + " " + p.substring(6);
        } else {
          mapped.extractedPhone = p;
        }
      }
      if (parsed.pnc_license_number) mapped.extractedLicense = String(parsed.pnc_license_number);
      if (parsed.address) mapped.extractedAddress = String(parsed.address);
      if (parsed.languages) mapped.extractedLanguages = String(parsed.languages);
      if (parsed.education) mapped.extractedEducation = String(parsed.education);
      if (parsed.experience) mapped.extractedExperience = String(parsed.experience);
      if (parsed.skills) mapped.extractedSkills = String(parsed.skills);
      if (parsed.certifications) mapped.extractedCertifications = String(parsed.certifications);

      if (Object.keys(mapped).length > 0) return mapped;
      return null;
    } catch (err) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) continue;
      return null;
    }
  }
  return null;
}

function mergeData(entries: Array<Record<string, string>>): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const entry of entries) {
    for (const [key, value] of Object.entries(entry)) {
      if (value && !merged[key]) {
        merged[key] = value;
      }
    }
  }
  return merged;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const cvFile = formData.get("cv") as File | null;
    const pncFile = formData.get("pnc") as File | null;

    if ((!cvFile || cvFile.size === 0) && (!pncFile || pncFile.size === 0)) {
      return new Response(
        JSON.stringify({ extractedData: {}, warning: "No files uploaded" }),
        { headers: corsHeaders },
      );
    }

    const warnings: string[] = [];
    const filesToProcess: Array<{ file: File; source: string }> = [];

    for (const [key, file] of [["cv", cvFile], ["pnc", pncFile]] as const) {
      if (!file || file.size === 0) continue;
      if (file.size > MAX_FILE_SIZE) {
        warnings.push(`${key} file exceeds 5MB limit`);
        continue;
      }
      filesToProcess.push({ file, source: key });
    }

    // Try Gemini first for each file
    const geminiResults: Array<Record<string, string>> = [];
    const textFallbacks: string[] = [];

    for (const { file, source } of filesToProcess) {
      // For text files, read text directly as fallback
      if (isTextFile(file.name)) {
        textFallbacks.push(await file.text());
      }

      const geminiResult = await callGemini(file);
      if (geminiResult && Object.keys(geminiResult).length > 0) {
        geminiResults.push(geminiResult);
        console.log(`Gemini succeeded for ${source}:${file.name}`);
      } else {
        console.log(`Gemini failed for ${source}:${file.name}, will use regex fallback`);
        if (isTextFile(file.name)) {
          // Already added to textFallbacks above
        } else {
          warnings.push(`Could not extract text from ${file.name} (unsupported format)`);
        }
      }
    }

    // Merge Gemini results (CV takes priority for overlapping fields)
    let extractedData: Record<string, string> = {};
    if (geminiResults.length > 0) {
      extractedData = mergeData(geminiResults);
    }

    // Regex fallback for text files
    if (Object.keys(extractedData).length === 0 && textFallbacks.length > 0) {
      const combinedText = textFallbacks.join("\n---\n");
      extractedData = extractViaRegex(combinedText);
      if (Object.keys(extractedData).length > 0) {
        console.log("Regex fallback extracted data from text files");
      }
    }

    return new Response(
      JSON.stringify({
        extractedData,
        warnings: warnings.length > 0 ? warnings : undefined,
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("Extraction error:", err);
    return new Response(
      JSON.stringify({
        extractedData: {},
        error: err instanceof Error ? err.message : "Failed to process files",
      }),
      { headers: corsHeaders },
    );
  }
});
