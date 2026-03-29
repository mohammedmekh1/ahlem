-- Consolidated Migration: Final Cleanup and Hardening

-- 1. Ensure all tables have RLS enabled
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Performance: Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_exams_unique_slug ON public.exams(unique_slug);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON public.exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_candidate_id ON public.exam_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_candidate_id ON public.student_responses(candidate_id);

-- 3. Data Integrity: Ensure profiles are updated via trigger (Fallback)
CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Secure API Key Fallback Logic (Function)
-- This allows checking for an org-wide key if the individual key is missing
CREATE OR REPLACE FUNCTION public.get_effective_gemini_key(user_uuid UUID, org_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_key TEXT;
    owner_key TEXT;
    owner_uuid UUID;
BEGIN
    -- 1. Check user key
    SELECT encrypted_gemini_key INTO user_key FROM public.profiles WHERE id = user_uuid;
    IF user_key IS NOT NULL THEN
        RETURN user_key;
    END IF;

    -- 2. Check org owner key
    SELECT owner_id INTO owner_uuid FROM public.organizations WHERE id = org_uuid;
    SELECT encrypted_gemini_key INTO owner_key FROM public.profiles WHERE id = owner_uuid;

    RETURN owner_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
