-- Create nursing_applications table
CREATE TABLE IF NOT EXISTS public.nursing_applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  ai_extracted_data JSONB DEFAULT '{}'::jsonb,
  survey_link_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id BIGSERIAL PRIMARY KEY,
  survey_data JSONB DEFAULT '{}'::jsonb,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.nursing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated and anon roles via the API
GRANT ALL ON public.nursing_applications TO authenticated, anon;
GRANT ALL ON public.survey_responses TO authenticated, anon;
GRANT USAGE ON SEQUENCE public.nursing_applications_id_seq TO authenticated, anon;
GRANT USAGE ON SEQUENCE public.survey_responses_id_seq TO authenticated, anon;

-- Verify
SELECT 'Tables created:' AS info, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('nursing_applications', 'survey_responses');
