-- ═══════════════════════════════════════════════════════════════
--   EXAM Platform — Phase 1 Migration
--   الأدوار + الاختبارات + الأسئلة + النتائج + الدعوات
-- ═══════════════════════════════════════════════════════════════

-- 1. تحديث جدول profiles لإضافة الأدوار والخطة
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role        text        NOT NULL DEFAULT 'student'
                                       CHECK (role IN ('owner','admin','teacher','student')),
  ADD COLUMN IF NOT EXISTS full_name   text,
  ADD COLUMN IF NOT EXISTS plan        text        NOT NULL DEFAULT 'free'
                                       CHECK (plan IN ('free','pro','enterprise')),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS avatar_url  text,
  ADD COLUMN IF NOT EXISTS is_active   boolean     NOT NULL DEFAULT true;

-- إذا لم يكن الجدول موجوداً، ننشئه
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text        NOT NULL,
  full_name       text,
  role            text        NOT NULL DEFAULT 'student'
                              CHECK (role IN ('owner','admin','teacher','student')),
  plan            text        NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free','pro','enterprise')),
  plan_expires_at timestamptz,
  avatar_url      text,
  is_active       boolean     NOT NULL DEFAULT true,
  is_admin        boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
  ));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
  ));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. جدول الاختبارات ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exams (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  description     text,
  subject         text,
  teacher_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes int        NOT NULL DEFAULT 30,
  max_attempts    int         NOT NULL DEFAULT 1,
  passing_score   int         NOT NULL DEFAULT 50,
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','published','closed','archived')),
  invite_code     text        UNIQUE,
  allow_anonymous boolean     NOT NULL DEFAULT true,
  show_results    boolean     NOT NULL DEFAULT true,
  shuffle_questions boolean   NOT NULL DEFAULT false,
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own exams"
  ON public.exams FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "Published exams are viewable by all"
  ON public.exams FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all exams"
  ON public.exams FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
  ));

-- ─── 3. جدول الأسئلة ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid        NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text   text        NOT NULL,
  question_type   text        NOT NULL DEFAULT 'mcq'
                              CHECK (question_type IN ('mcq','true_false','short_answer','essay')),
  options         jsonb,
  correct_answer  text,
  explanation     text,
  points          int         NOT NULL DEFAULT 1,
  order_index     int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage questions of own exams"
  ON public.questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = exam_id AND e.teacher_id = auth.uid()
  ));

CREATE POLICY "Questions visible during active exam"
  ON public.questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = exam_id AND e.status = 'published'
  ));

-- ─── 4. جلسات الامتحانات (للطلاب) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid        NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name    text        NOT NULL,
  student_email   text        NOT NULL,
  started_at      timestamptz NOT NULL DEFAULT now(),
  submitted_at    timestamptz,
  time_spent_sec  int,
  status          text        NOT NULL DEFAULT 'in_progress'
                              CHECK (status IN ('in_progress','submitted','expired')),
  answers         jsonb       DEFAULT '{}',
  score           numeric(5,2),
  passed          boolean,
  ip_address      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create and view own sessions"
  ON public.exam_sessions FOR ALL
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND e.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous exam access (by invite)"
  ON public.exam_sessions FOR INSERT
  WITH CHECK (true);

-- ─── 5. نتائج التصحيح التفصيلية ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.exam_results (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid        NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_id     uuid        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  student_answer  text,
  is_correct      boolean,
  points_earned   numeric(5,2) DEFAULT 0,
  feedback        text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results visible to student and teacher"
  ON public.exam_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.exam_sessions s
    JOIN public.exams e ON e.id = s.exam_id
    WHERE s.id = session_id AND (
      s.student_id = auth.uid() OR
      e.teacher_id = auth.uid()
    )
  ));

-- ─── 6. دعوات الاختبارات ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exam_invitations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid        NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  email           text        NOT NULL,
  token           text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'),
  used_at         timestamptz,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own invitations"
  ON public.exam_invitations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = exam_id AND e.teacher_id = auth.uid()
  ));

CREATE POLICY "Anyone can view invitation by token"
  ON public.exam_invitations FOR SELECT
  USING (true);

-- ─── 7. خطط الاشتراك والمدفوعات ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            text        NOT NULL CHECK (plan IN ('free','pro','enterprise')),
  status          text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','cancelled','expired','trialing')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
  ON public.subscriptions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
  ));

-- ─── 8. Function: generate invite code ───────────────────────
CREATE OR REPLACE FUNCTION public.generate_exam_invite_code()
RETURNS text LANGUAGE sql AS $$
  SELECT upper(substring(encode(gen_random_bytes(4),'hex') FROM 1 FOR 8));
$$;

-- ─── 9. Function: calculate exam score ───────────────────────
CREATE OR REPLACE FUNCTION public.calculate_session_score(p_session_id uuid)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_points numeric;
  v_earned_points numeric;
BEGIN
  SELECT COALESCE(SUM(q.points), 0) INTO v_total_points
  FROM public.questions q
  JOIN public.exam_sessions s ON s.exam_id = q.exam_id
  WHERE s.id = p_session_id;

  SELECT COALESCE(SUM(r.points_earned), 0) INTO v_earned_points
  FROM public.exam_results r
  WHERE r.session_id = p_session_id;

  IF v_total_points = 0 THEN RETURN 0; END IF;
  RETURN ROUND((v_earned_points / v_total_points) * 100, 2);
END;
$$;

-- ─── 10. Grants ───────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.exam_sessions     TO authenticated, anon;
GRANT SELECT ON public.exam_results                      TO authenticated;
GRANT INSERT ON public.exam_results                      TO authenticated, anon;
GRANT SELECT, INSERT ON public.exam_invitations          TO authenticated, anon;
GRANT SELECT ON public.subscriptions                     TO authenticated;

GRANT EXECUTE ON FUNCTION public.generate_exam_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_session_score(uuid) TO authenticated, anon;
