-- Migration: Phase 4 Persistence

CREATE TABLE IF NOT EXISTS public.student_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unique(candidate_id, question_id)
);

ALTER TABLE public.student_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can insert responses" ON public.student_responses
FOR INSERT TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.candidates WHERE id = candidate_id AND exam_id = student_responses.exam_id)
);

CREATE POLICY "Staff can view responses" ON public.student_responses
FOR SELECT TO authenticated USING (
    public.is_global_admin() OR
    public.get_org_role((SELECT organization_id FROM public.exams WHERE exams.id = student_responses.exam_id)) IN ('owner', 'admin', 'teacher', 'assistant')
);
