// Edge Function: extract-info
// Accepts file upload via FormData, parses text content to extract
// name, email, phone, PNC license, and other fields.
// For .txt files: reads text and extracts via regex patterns.
// For images/PDF: returns metadata only (OCR not available in Deno).

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return new Response(
        JSON.stringify({
          extractedData: {},
          warning: "No file uploaded",
        }),
        { headers: corsHeaders },
      );
    }

    const fileName = file.name.toLowerCase();
    let text = "";

    // Try to read text content from the file
    if (fileName.endsWith(".txt")) {
      text = await file.text();
    } else if (fileName.endsWith(".csv")) {
      text = await file.text();
    } else if (fileName.endsWith(".json")) {
      text = await file.text();
    } else if (fileName.endsWith(".md")) {
      text = await file.text();
    } else {
      // Binary file (image, PDF, docx) — not parseable in Deno without heavy deps
      return new Response(
        JSON.stringify({
          extractedData: {},
          warning: "File type not supported for text extraction. Supported: .txt, .csv, .json, .md",
          fileName: file.name,
          fileSize: file.size,
        }),
        { headers: corsHeaders },
      );
    }

    // Extract fields via regex patterns
    const extractedData: Record<string, string> = {};

    // Name: "Name: X" or "Dr. X" or "Nurse X" patterns
    const nameMatch = text.match(/(?:Name|name|Candidate|Nurse|Dr\.)\s*:\s*([A-Za-z\s.]+)/);
    if (nameMatch) extractedData.extractedName = nameMatch[1].trim();
    else {
      // Fallback: look for "Dr." or professional name pattern at line start
      const drMatch = text.match(/(Dr\.\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      if (drMatch) extractedData.extractedName = drMatch[1].trim();
    }

    // Email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) extractedData.extractedEmail = emailMatch[1].trim();

    // Phone: Pakistan format (+92 3XX XXXXXXX) or international
    const phoneMatch = text.match(/(?:\+92|0|92)?[\s-]?3\d{2}[\s-]?\d{7}/);
    if (phoneMatch) {
      let phone = phoneMatch[0].replace(/\s+/g, "").replace(/-/g, "");
      if (phone.startsWith("0")) phone = "+92" + phone.substring(1);
      else if (phone.startsWith("92") && !phone.startsWith("+92")) phone = "+" + phone;
      else if (!phone.startsWith("+")) phone = "+92" + phone;
      // Format as +92 3XX XXXXXXX
      if (phone.startsWith("+92") && phone.length >= 12) {
        extractedData.extractedPhone = "+92 " + phone.substring(3, 6) + " " + phone.substring(6);
      } else {
        extractedData.extractedPhone = phone;
      }
    } else {
      // Try any phone-like pattern
      const anyPhone = text.match(/(\+\d{1,3}[\s-]?\d{8,12})/);
      if (anyPhone) extractedData.extractedPhone = anyPhone[1].trim();
    }

    // PNC License: "PNC-XXXXX" or "PNC XXXXX" or "License: XXXX"
    const pncMatch = text.match(/(?:PNC|Pnc|pnc)[\s-]*(\d{4,10})/);
    if (pncMatch) extractedData.extractedLicense = "PNC-" + pncMatch[1];
    else {
      const licMatch = text.match(/(?:License|Licence|license|licence)\s*:\s*([A-Za-z0-9-]+)/i);
      if (licMatch) extractedData.extractedLicense = licMatch[1].trim();
    }

    // Address
    const addrMatch = text.match(/(?:Address|address)\s*:\s*(.+)/);
    if (addrMatch) extractedData.extractedAddress = addrMatch[1].trim();

    // Languages
    const langMatch = text.match(/(?:Languages|languages)\s*:\s*(.+)/);
    if (langMatch) extractedData.extractedLanguages = langMatch[1].trim();

    // Education / qualification
    const eduMatch = text.match(/(?:Education|Qualification|qualification|education)\s*:\s*(.+)/);
    if (eduMatch) extractedData.extractedEducation = eduMatch[1].trim();

    // Experience
    const expMatch = text.match(/(?:Experience|experience)\s*:\s*(.+)/);
    if (expMatch) extractedData.extractedExperience = expMatch[1].trim();

    // Skills
    const skillsMatch = text.match(/(?:Skills|skills)\s*:\s*(.+)/);
    if (skillsMatch) extractedData.extractedSkills = skillsMatch[1].trim();

    // Certifications
    const certMatch = text.match(/(?:Certifications|certifications)\s*:\s*(.+)/);
    if (certMatch) extractedData.extractedCertifications = certMatch[1].trim();

    return new Response(
      JSON.stringify({
        extractedData,
        fileName: file.name,
        fileSize: file.size,
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("Extraction error:", err);
    return new Response(
      JSON.stringify({
        extractedData: {},
        error: err instanceof Error ? err.message : "Failed to process file",
      }),
      { headers: corsHeaders },
    );
  }
});
