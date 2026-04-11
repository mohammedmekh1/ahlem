"use client";
import React, { useState } from 'react';
import { Database, Play, CheckCircle, AlertCircle, Loader2, Users, ClipboardList, BarChart3 } from 'lucide-react';

interface Result { step: string; ok: boolean; msg: string; }

export default function SeedPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done,    setDone]    = useState(false);

  const log = (step: string, ok: boolean, msg: string) =>
    setResults(r => [...r, { step, ok, msg }]);

  const seed = async () => {
    setRunning(true); setResults([]); setDone(false);
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s  = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();

      // ── Step 1: Get current user (owner) ──
      const { data: { user } } = await db.auth.getUser();
      if (!user) throw new Error('لا يوجد مستخدم');
      log('المستخدم الحالي', true, user.email!);

      // ── Step 2: Ensure owner role ──
      await db.from('profiles').upsert({ id: user.id, email: user.email!, role: 'owner', is_admin: true, full_name: 'مالك المنصة' });
      log('الدور', true, 'تم تعيين role = owner');

      // ── Step 3: Create demo exam ──
      const { data: codeRes } = await db.rpc('generate_exam_invite_code');
      const inviteCode = codeRes as string;

      const { data: exam, error: eErr } = await db.from('exams').insert({
        title: 'اختبار تجريبي — الرياضيات الأساسية',
        subject: 'رياضيات',
        description: 'اختبار تجريبي لاستكشاف المنصة',
        teacher_id: user.id,
        duration_minutes: 10,
        max_attempts: 3,
        passing_score: 60,
        status: 'published',
        invite_code: inviteCode,
        shuffle_questions: false,
        show_results: true,
        allow_anonymous: true,
      }).select().single();
      if (eErr) throw eErr;
      log('اختبار تجريبي', true, `رمز الدعوة: ${inviteCode}`);

      // ── Step 4: Add demo questions ──
      const questions = [
        { question_text: 'كم يساوي 7 × 8؟', question_type: 'mcq', options: ['54','56','64','48'], correct_answer: '56', explanation: '7 × 8 = 56', points: 2, order_index: 0 },
        { question_text: 'الجذر التربيعي لـ 144 يساوي؟', question_type: 'mcq', options: ['10','11','12','13'], correct_answer: '12', explanation: '√144 = 12', points: 2, order_index: 1 },
        { question_text: 'π تقريباً تساوي 3.14', question_type: 'true_false', options: ['صح','خطأ'], correct_answer: 'صح', explanation: 'قيمة π ≈ 3.14159', points: 1, order_index: 2 },
        { question_text: '2 + 2 = 5', question_type: 'true_false', options: ['صح','خطأ'], correct_answer: 'خطأ', explanation: '2 + 2 = 4', points: 1, order_index: 3 },
        { question_text: 'ما هو ناتج 15 ÷ 3؟', question_type: 'short_answer', options: [], correct_answer: '5', explanation: '15 ÷ 3 = 5', points: 2, order_index: 4 },
      ];
      const { error: qErr } = await db.from('questions').insert(questions.map(q => ({ ...q, exam_id: exam.id })));
      if (qErr) throw qErr;
      log('الأسئلة', true, `${questions.length} أسئلة تجريبية`);

      // ── Step 5: Create demo session (archived result) ──
      const { data: session } = await db.from('exam_sessions').insert({
        exam_id: exam.id, student_name: 'فاطمة التجريبية',
        student_email: 'fatima@demo.exam', status: 'submitted',
        started_at: new Date(Date.now() - 600000).toISOString(),
        submitted_at: new Date().toISOString(), score: 80, passed: true,
        answers: { [questions[0].question_text]: '56' },
      }).select().single();
      if (session) log('جلسة مؤرشفة', true, 'طالبة تجريبية — 80%');

      // ── Step 6: Create second demo exam (draft) ──
      const { data: code2 } = await db.rpc('generate_exam_invite_code');
      await db.from('exams').insert({
        title: 'اختبار اللغة العربية — النحو',
        subject: 'لغة عربية', teacher_id: user.id,
        duration_minutes: 20, passing_score: 70, status: 'draft',
        invite_code: code2 as string, show_results: true, allow_anonymous: true,
      });
      log('اختبار مسودة', true, 'اختبار لغة عربية — مسودة');

      log('✅ اكتمل', true, `رابط الاختبار التجريبي: /exam/${inviteCode}`);
      setDone(true);
    } catch (err) {
      log('خطأ', false, err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  };

  const accounts = [
    { role: 'مالك / مشرف', email: 'admin@exam.dz',   pass: 'Admin123!',   color: 'from-purple-500 to-indigo-600', icon: '🛡️' },
    { role: 'معلم',         email: 'teacher@exam.dz', pass: 'Teacher123!', color: 'from-emerald-500 to-teal-600',  icon: '📚' },
    { role: 'طالب',         email: 'student@exam.dz', pass: 'Student123!', color: 'from-blue-500 to-cyan-600',     icon: '🎓' },
  ];

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="h-6 w-6 text-indigo-500" />
          بيانات تجريبية
        </h1>
        <p className="text-gray-500 text-sm mt-1">تهيئة المنصة بحسابات وبيانات للاختبار</p>
      </div>

      {/* Demo accounts */}
      <div className="exam-card p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" /> حسابات الاختبار
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          سجّل هذه الحسابات يدوياً من <a href="/auth/register" className="text-indigo-500 hover:underline">/auth/register</a> أو أنشئها من Supabase Dashboard
        </p>
        <div className="space-y-3">
          {accounts.map((a, i) => (
            <div key={i} className={`rounded-xl p-4 bg-gradient-to-r ${a.color} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{a.role}</p>
                  <p className="text-white/80 text-xs mt-0.5 font-mono">{a.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">كلمة المرور</p>
                <p className="font-mono font-bold text-sm">{a.pass}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <strong>بعد التسجيل:</strong> شغّل SQL التالي في Supabase لتعيين الأدوار:
          <pre className="mt-2 bg-amber-100 p-2 rounded text-xs overflow-x-auto">{`UPDATE public.profiles SET role='admin', is_admin=true WHERE email='admin@exam.dz';
UPDATE public.profiles SET role='teacher' WHERE email='teacher@exam.dz';`}</pre>
        </div>
      </div>

      {/* Seed button */}
      <div className="exam-card p-5">
        <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-indigo-500" /> بيانات الاختبار
        </h2>
        <p className="text-sm text-gray-500 mb-4">ينشئ للحساب الحالي: اختبارَين + 5 أسئلة + جلسة مؤرشفة</p>
        <button onClick={seed} disabled={running || done}
          className="exam-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {running ? <><Loader2 className="h-4 w-4 animate-spin" />جاري الإنشاء...</>
            : done ? <><CheckCircle className="h-4 w-4" />تم الإنشاء</>
            : <><Play className="h-4 w-4" />إنشاء البيانات</>}
        </button>

        {results.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-sm ${r.ok ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {r.ok ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <span className={`font-medium ${r.ok ? 'text-emerald-700' : 'text-red-700'}`}>{r.step}</span>
                  <span className="text-gray-500 mr-2">{r.msg}</span>
                </div>
              </div>
            ))}
            {done && (
              <div className="mt-3 flex gap-2">
                <a href="/app/teacher/exams" className="exam-btn-primary text-xs py-2">← لوحة المعلم</a>
                <a href="/app" className="exam-btn-secondary text-xs py-2">لوحة التحكم</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="exam-card p-5">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" /> خطوات الاختبار
        </h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>سجّل دخول كمعلم → أنشئ اختباراً → انسخ الرابط</li>
          <li>افتح رابط الاختبار في نافذة خاصة (بدون تسجيل)</li>
          <li>أدخل اسمك وإيميلك وابدأ الاختبار</li>
          <li>ارجع للوحة المعلم وتحقق من النتائج</li>
          <li>سجّل دخول كمشرف وراجع كل البيانات</li>
        </ol>
      </div>
    </div>
  );
}
