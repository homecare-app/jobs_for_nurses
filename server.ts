import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API routes FIRST
  app.post("/api/apply", async (req, res) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("Supabase credentials not configured.");
        // Simulate success if credentials are not yet configured for UI demo purposes
        return res.json({ success: true, simulated: true });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { fullName, phone, email, licenseNumber } = req.body;

      // Note: Make sure "nursing_applications" table exists in your Supabase project
      const { data, error } = await supabase
        .from("nursing_applications")
        .insert([{ 
          full_name: fullName, 
          phone: phone, 
          email: email, 
          license_number: licenseNumber 
        }]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      res.json({ success: true, data });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
