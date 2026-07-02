// Edge Function: extract-info
// Accepts file upload via FormData, returns empty extracted data
// (No OCR in Deno runtime — form still works with manual input)

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
    // Consume the body so the request doesn't hang
    await req.formData().catch(() => {});
  } catch {
    // Ignore parse errors
  }

  return new Response(
    JSON.stringify({ extractedData: {} }),
    { headers: corsHeaders },
  );
});
