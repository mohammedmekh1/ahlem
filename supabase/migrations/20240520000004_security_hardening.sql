-- Migration: Phase 3 Security Hardening

-- 1. Create a secure view for questions (hiding correct_answer)
CREATE OR REPLACE VIEW public.student_questions AS
SELECT id, exam_id, content, options, points, type, difficulty, subject_id, explanation
FROM public.questions;

-- 2. Update RLS policies
-- Remove previous permissive policies
DROP POLICY IF EXISTS "Public can view questions for an exam they are taking" ON public.questions;
DROP POLICY IF EXISTS "Public can insert results (on completion)" ON public.exam_results;
DROP POLICY IF EXISTS "Candidates can insert their own results" ON public.exam_results;

-- Restrict base questions table to staff only
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
-- (Existing policies for teachers/admins remain valid)

-- Allow public to see the view (Postgres views inherit RLS from base tables,
-- but we can use security definer functions or just rely on the API layer)
-- Instead of a complex view RLS, we will simply ensure the base table RLS
-- only allows teachers/admins to see EVERYTHING, and we use a function
-- for students to fetch their questions.

CREATE OR REPLACE FUNCTION public.get_exam_questions(exam_slug TEXT)
RETURNS TABLE (
    id UUID,
    content TEXT,
    options JSONB,
    points INT,
    type TEXT
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT q.id, q.content, q.options, q.points, q.type
  FROM public.questions q
  JOIN public.exams e ON q.exam_id = e.id
  WHERE e.unique_slug = exam_slug;
$$;

-- 3. Exam Results Policy: ONLY allow server-side insertion via Service Role
-- (which is what createServerAdminClient uses).
-- No public INSERT allowed anymore.
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view results" ON public.exam_results
FOR SELECT TO authenticated USING (
    public.is_global_admin() OR
    public.get_org_role((SELECT organization_id FROM public.exams WHERE exams.id = exam_results.exam_id)) IN ('owner', 'admin', 'teacher')
);
