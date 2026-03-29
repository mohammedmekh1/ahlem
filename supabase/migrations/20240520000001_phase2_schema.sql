-- Migration: Phase 2 - Advanced Question Engine and Subjects

-- 1. Create Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- 2. Update profiles for API keys (Note: In production, use pgsodium for encryption)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS encrypted_gemini_key TEXT;

-- 3. Update questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'mcq' CHECK (type IN ('mcq', 'true_false', 'essay'));
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- 4. RLS Policies for Subjects
CREATE POLICY "Global Admins can manage all subjects" ON public.subjects
FOR ALL TO authenticated USING (public.is_global_admin());

CREATE POLICY "Org members can view subjects" ON public.subjects
FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = subjects.organization_id AND user_id = auth.uid())
);

CREATE POLICY "Teachers and Owners can manage subjects" ON public.subjects
FOR ALL TO authenticated USING (
    public.get_org_role(organization_id) IN ('owner', 'admin', 'teacher')
);

-- Update Questions Policies for subjects
CREATE POLICY "Assistants and above can manage questions based on subject" ON public.questions
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.subjects
        WHERE subjects.id = questions.subject_id
        AND public.get_org_role(subjects.organization_id) IN ('owner', 'admin', 'teacher', 'assistant')
    )
);
