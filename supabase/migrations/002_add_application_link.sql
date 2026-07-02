-- Add application_id to survey_responses to link survey back to application
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS application_id BIGINT REFERENCES public.nursing_applications(id) ON DELETE SET NULL;

-- Add index for fast lookup
CREATE INDEX IF NOT EXISTS idx_survey_responses_application_id ON public.survey_responses(application_id);

-- Add stored file metadata columns to nursing_applications
ALTER TABLE public.nursing_applications
ADD COLUMN IF NOT EXISTS cv_file_url TEXT,
ADD COLUMN IF NOT EXISTS pnc_file_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('nursing_applications', 'survey_responses')
ORDER BY table_name, ordinal_position;
