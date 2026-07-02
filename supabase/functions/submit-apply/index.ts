// Edge Function: submit-apply
// Accepts FormData with application fields + CV/PNC files
// Stores files in Supabase Storage, inserts record in nursing_applications

import { createClient } from "npm:@supabase/supabase-js@2";

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

    // Extract text fields
    const fields = {
      fullName: formData.get("fullName")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      licenseNumber: formData.get("licenseNumber")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      languages: formData.get("languages")?.toString() || "",
      education: formData.get("education")?.toString() || "",
      experience: formData.get("experience")?.toString() || "",
      skills: formData.get("skills")?.toString() || "",
      certifications: formData.get("certifications")?.toString() || "",
    };

    // Extract files
    const cvFile = formData.get("cv") as File | null;
    const pncFile = formData.get("pnc") as File | null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Create storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b: { name: string }) => b.name === "applications")) {
      await supabase.storage.createBucket("applications", {
        public: false,
      });
    }

    // Upload files to storage
    const uploadedFiles: Array<{ name: string; path: string; type: string }> = [];

    if (cvFile && cvFile.size > 0) {
      const cvBytes = await cvFile.arrayBuffer();
      const cvPath = `${Date.now()}-cv-${cvFile.name}`;
      const { error: cvErr } = await supabase.storage
        .from("applications")
        .upload(cvPath, cvBytes, {
          contentType: cvFile.type || "application/octet-stream",
        });
      if (!cvErr) {
        uploadedFiles.push({ name: cvFile.name, path: cvPath, type: "cv" });
      }
    }

    if (pncFile && pncFile.size > 0) {
      const pncBytes = await pncFile.arrayBuffer();
      const pncPath = `${Date.now()}-pnc-${pncFile.name}`;
      const { error: pncErr } = await supabase.storage
        .from("applications")
        .upload(pncPath, pncBytes, {
          contentType: pncFile.type || "application/octet-stream",
        });
      if (!pncErr) {
        uploadedFiles.push({ name: pncFile.name, path: pncPath, type: "pnc" });
      }
    }

    // Insert application record
    const { data, error } = await supabase
      .from("nursing_applications")
      .insert({
        full_name: fields.fullName || null,
        phone: fields.phone || null,
        email: fields.email || null,
        license_number: fields.licenseNumber || null,
        ai_extracted_data: {
          address: fields.address || null,
          languages: fields.languages || null,
          education: fields.education || null,
          experience: fields.experience || null,
          skills: fields.skills || null,
          certifications: fields.certifications || null,
          uploaded_files: uploadedFiles.length > 0 ? uploadedFiles : null,
        },
        survey_link_sent: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        extractedData: {},
        message: "Application received and survey link generated.",
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Submit error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit application",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
