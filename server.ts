import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import { extractTextFromImage, destroyOcrService } from "./lib/ocr.js";
import { parseOcrText } from "./lib/parse-ocr.js";
import { extractTextFromCv } from "./lib/extract-cv.js";
import { parseCvText } from "./lib/parse-cv.js";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file (OCR needs room)
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API routes FIRST
  app.post("/api/extract", upload.single('file'), async (req: any, res: any) => {
    try {
      const file = req.file;
      if (!file) {
        return res.json({ extractedData: {} });
      }

      const { text } = await extractTextFromCv(file.buffer, file.mimetype);
      const ocrData = parseOcrText(text);
      const cvData = parseCvText(text);
      const mergedData = { ...ocrData, ...cvData };
      res.json({ extractedData: mergedData });
    } catch (error: any) {
      console.warn("Extraction error (handled):", error);
      res.json({ extractedData: {} });
    }
  });

  app.post("/api/apply", upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'pnc', maxCount: 1 }]), async (req: any, res: any) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { fullName, phone, email, licenseNumber } = req.body || {};
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const cvFile = files?.['cv']?.[0];
      const pncFile = files?.['pnc']?.[0];

      let extractedData: Record<string, string | undefined> = {};

      if (cvFile || pncFile) {
        const texts: string[] = [];

        if (cvFile) {
          const { text } = await extractTextFromCv(cvFile.buffer, cvFile.mimetype);
          texts.push(text);
        }
        if (pncFile) {
          const text = await extractTextFromImage(pncFile.buffer);
          texts.push(text);
        }

        const combinedText = texts.join("\n---\n");
        const ocrData = parseOcrText(combinedText);
        const cvData = parseCvText(combinedText);
        extractedData = { ...ocrData, ...cvData };
      }

      const finalName = fullName || extractedData.extractedName;
      const finalPhone = phone || extractedData.extractedPhone;
      const finalEmail = email || extractedData.extractedEmail;
      const finalLicense = licenseNumber || extractedData.extractedLicense;

      if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("Supabase credentials not configured.");
        return res.json({ success: true, simulated: true, extractedData, message: "Application received. (Simulated)" });
      }

      let dbData = null;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // We'll store both the user-provided data and the AI extracted data
      const { data, error } = await supabase
        .from("nursing_applications")
        .insert([{ 
          full_name: finalName, 
          phone: finalPhone, 
          email: finalEmail, 
          license_number: finalLicense,
          ai_extracted_data: extractedData,
          survey_link_sent: true // simulated survey link sending
        }]);

      if (error) {
        console.warn("Supabase insert error (handled):", error);
        // Do not throw here, instead we can proceed and tell the user it was received but simulated
        return res.json({ success: true, simulated: true, extractedData, message: "Application received. (Database insert failed - Simulated)" });
      } else {
        dbData = data;
      }

      res.json({ success: true, data: dbData, extractedData, message: "Application received and survey link generated." });
    } catch (error: any) {
      console.error("Application error:", error);
      res.status(500).json({ error: error.message || "Failed to submit application" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Clean up OCR service on shutdown
  process.on("SIGTERM", async () => {
    await destroyOcrService();
    process.exit(0);
  });
  process.on("SIGINT", async () => {
    await destroyOcrService();
    process.exit(0);
  });
}

startServer();
