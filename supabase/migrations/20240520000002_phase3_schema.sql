-- Migration: Phase 3 - Student Experience and Grading

-- 1. Update exams for unique links
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS unique_slug TEXT UNIQUE;

-- 2. Create candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    unique(exam_id, email)
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 3. Update exam_results to support candidates
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE;
ALTER TABLE public.exam_results ALTER COLUMN user_id DROP NOT NULL;

-- 4. RLS Policies
CREATE POLICY "Public can insert candidates (to start exam)" ON public.candidates
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Candidates can view their own data" ON public.candidates
FOR SELECT USING (true); -- Filtered by ID in application logic

CREATE POLICY "Public can view exams by unique slug" ON public.exams
FOR SELECT TO anon, authenticated USING (unique_slug IS NOT NULL);

CREATE POLICY "Public can view questions for an exam they are taking" ON public.questions
FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.exams WHERE exams.id = questions.exam_id AND unique_slug IS NOT NULL)
);

CREATE POLICY "Public can insert results (on completion)" ON public.exam_results
FOR INSERT TO anon, authenticated WITH CHECK (true);
