-- Migration: Add RBAC roles and Content tables (Exams, Invitations)

-- 1. Update organization_members roles
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_role_check
CHECK (role IN ('owner', 'admin', 'teacher', 'assistant', 'member'));

-- 2. Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'assistant', 'member')),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 3. Create Content Tables
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    options JSONB, -- For multiple choice
    correct_answer TEXT,
    points INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score DECIMAL,
    max_score DECIMAL,
    feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Helper function to check if user is Global Admin
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get user role in organization
CREATE OR REPLACE FUNCTION public.get_org_role(org_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = org_id AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Invitations Policies
CREATE POLICY "Global Admins can manage all invitations" ON public.invitations
FOR ALL TO authenticated USING (public.is_global_admin());

CREATE POLICY "Teachers and Owners can manage org invitations" ON public.invitations
FOR ALL TO authenticated USING (
    public.get_org_role(organization_id) IN ('owner', 'admin', 'teacher')
);

-- Exams Policies
CREATE POLICY "Global Admins can manage all exams" ON public.exams
FOR ALL TO authenticated USING (public.is_global_admin());

CREATE POLICY "Org members can view exams" ON public.exams
FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = exams.organization_id AND user_id = auth.uid())
);

CREATE POLICY "Teachers and Owners can manage exams" ON public.exams
FOR ALL TO authenticated USING (
    public.get_org_role(organization_id) IN ('owner', 'admin', 'teacher')
);

-- Questions Policies
CREATE POLICY "Global Admins can manage all questions" ON public.questions
FOR ALL TO authenticated USING (public.is_global_admin());

CREATE POLICY "Assistants and above can manage questions" ON public.questions
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE exams.id = questions.exam_id
        AND public.get_org_role(exams.organization_id) IN ('owner', 'admin', 'teacher', 'assistant')
    )
);

CREATE POLICY "Members can view questions (for taking exams)" ON public.questions
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE exams.id = questions.exam_id
        AND EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = exams.organization_id AND user_id = auth.uid())
    )
);

-- Exam Results Policies
CREATE POLICY "Global Admins can view all results" ON public.exam_results
FOR SELECT TO authenticated USING (public.is_global_admin());

CREATE POLICY "Users can view their own results" ON public.exam_results
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Teachers and above can view all results in org" ON public.exam_results
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE exams.id = exam_results.exam_id
        AND public.get_org_role(exams.organization_id) IN ('owner', 'admin', 'teacher')
    )
);

CREATE POLICY "Users can insert their own results" ON public.exam_results
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
