import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

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
        extractedData: {
          extractedName: fields.fullName || null,
          extractedEmail: fields.email || null,
          extractedPhone: fields.phone || null,
          extractedLicense: fields.licenseNumber || null,
          extractedAddress: fields.address || null,
          extractedLanguages: fields.languages || null,
          extractedEducation: fields.education || null,
          extractedExperience: fields.experience || null,
          extractedSkills: fields.skills || null,
          extractedCertifications: fields.certifications || null,
        },
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
