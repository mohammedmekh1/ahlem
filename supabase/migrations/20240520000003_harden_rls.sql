-- Migration: Phase 3 Harden RLS

DROP POLICY IF EXISTS "Public can insert results (on completion)" ON public.exam_results;

CREATE POLICY "Candidates can insert their own results" ON public.exam_results
FOR INSERT TO anon, authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.candidates
        WHERE candidates.id = exam_results.candidate_id
        AND candidates.exam_id = exam_results.exam_id
    )
    OR
    (auth.uid() = user_id)
);
