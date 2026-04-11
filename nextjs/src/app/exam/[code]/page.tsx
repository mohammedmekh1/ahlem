"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { GraduationCap, Clock, AlertCircle, CheckCircle, Trophy, ChevronRight, Loader2 } from 'lucide-react';
import { createSPAClient } from '@/lib/supabase/client';

interface ExamData { id: string; title: string; subject: string; description: string; duration_minutes: number; passing_score: number; show_results: boolean; status: string; }
interface Question { id: string; question_text: string; question_type: string; options: string[]; points: number; order_index: number; }

type Phase = 'loading' | 'not_found' | 'info' | 'exam' | 'submitted';

export default function PublicExamPage() {
  const { code } = useParams() as { code: string };
  const [phase,   setPhase]   = useState<Phase>('loading');
  const [exam,    setExam]    = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score,   setScore]   = useState<number | null>(null);
  const [passed,  setPassed]  = useState(false);
  const [error,   setError]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load exam
  useEffect(() => {
    (async () => {
      try {
        const db = createSPAClient();
        const { data: examData } = await db.from('exams').select('*').eq('invite_code', code).single();
        if (!examData || examData.status !== 'published') { setPhase('not_found'); return; }
        setExam(examData);
        setTimeLeft(examData.duration_minutes * 60);
        const { data: qs } = await db.from('questions').select('id, question_text, question_type, options, points, order_index').eq('exam_id', examData.id).order('order_index');
        setQuestions(qs || []);
        setPhase('info');
      } catch { setPhase('not_found'); }
    })();
  }, [code]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); submitExam(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const startExam = async () => {
    if (!name.trim() || !email.trim()) { setError('الاسم والإيميل مطلوبان'); return; }
    setError('');
    try {
      const db = createSPAClient();
      const { data: session } = await db.from('exam_sessions').insert({ exam_id: exam!.id, student_name: name.trim(), student_email: email.trim(), status: 'in_progress' }).select().single();
      setSessionId(session!.id);
      setPhase('exam');
    } catch (e) { setError('فشل بدء الاختبار'); }
  };

  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current!);
    try {
      const db = createSPAClient();
      const { data: qs } = await db.from('questions').select('*').eq('exam_id', exam!.id);
      if (!qs) throw new Error('no questions');

      let correct = 0; let total = 0;
      const results = qs.map(q => {
        const ans = answers[q.id] || '';
        const isCorrect = ans.trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();
        if (isCorrect) correct += q.points;
        total += q.points;
        return { session_id: sessionId!, question_id: q.id, student_answer: ans, is_correct: isCorrect, points_earned: isCorrect ? q.points : 0 };
      });

      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const pass = pct >= exam!.passing_score;

      await db.from('exam_results').insert(results);
      await db.from('exam_sessions').update({ status: 'submitted', submitted_at: new Date().toISOString(), answers, score: pct, passed: pass }).eq('id', sessionId!);

      setScore(pct); setPassed(pass); setPhase('submitted');
    } catch { setScore(0); setPassed(false); setPhase('submitted'); }
    finally  { setSubmitting(false); }
  }, [answers, exam, sessionId, submitting]);

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const q = questions[current];

  if (phase === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /><p className="text-gray-400 text-sm">جاري التحميل...</p></div>
    </div>
  );

  if (phase === 'not_found') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="exam-card p-10 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">الاختبار غير موجود</h2>
        <p className="text-gray-500 text-sm">الرابط غير صحيح أو الاختبار غير متاح حالياً.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EXAM</span>
        </div>

        {/* Info Phase */}
        {phase === 'info' && (
          <div className="exam-card p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-indigo-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{exam?.title}</h1>
              {exam?.subject && <p className="text-gray-500 text-sm mt-1">{exam.subject}</p>}
              {exam?.description && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{exam.description}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'المدة', value: `${exam?.duration_minutes} دقيقة` },
                { label: 'الأسئلة', value: questions.length },
                { label: 'النجاح', value: `${exam?.passing_score}%` },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 bg-indigo-50 rounded-xl">
                  <div className="text-xl font-bold text-indigo-600">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4"><AlertCircle className="h-4 w-4" />{error}</div>}

            <div className="space-y-3 mb-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">اسمك الكامل *</label><input className="exam-input" placeholder="محمد عبدالله" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">بريدك الإلكتروني *</label><input type="email" className="exam-input" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>

            <button onClick={startExam} className="exam-btn-primary w-full justify-center py-3 text-base">
              ابدأ الاختبار <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">بعد البدء لا يمكن إيقاف المؤقت</p>
          </div>
        )}

        {/* Exam Phase */}
        {phase === 'exam' && q && (
          <div className="animate-fade-in space-y-4">
            {/* Timer bar */}
            <div className="exam-card p-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">السؤال {current + 1} / {questions.length}</span>
              <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'}`}>
                <Clock className="h-4 w-4" />{fmt(timeLeft)}
              </div>
            </div>
            <div className="exam-progress"><div className="exam-progress-bar" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>

            {/* Question */}
            <div className="exam-card p-6">
              <p className="text-gray-800 font-medium text-lg leading-relaxed mb-6">{q.question_text}</p>
              <div className="space-y-3">
                {q.question_type === 'mcq' && (q.options as string[]).map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                    className={`quiz-option w-full text-right ${answers[q.id] === opt ? 'selected' : ''}`}>
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                      {['أ','ب','ج','د'][i]}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                ))}
                {q.question_type === 'true_false' && ['صح','خطأ'].map(v => (
                  <button key={v} onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                    className={`quiz-option w-full text-right ${answers[q.id] === v ? 'selected' : ''}`}>
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${answers[q.id] === v ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400'}`}>{v[0]}</span>
                    <span className="text-sm font-medium">{v}</span>
                  </button>
                ))}
                {q.question_type === 'short_answer' && (
                  <textarea className="exam-input resize-none w-full" rows={3} placeholder="اكتب إجابتك هنا..." value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {current > 0 && <button onClick={() => setCurrent(c => c - 1)} className="exam-btn-secondary">← السابق</button>}
              <div className="flex-1" />
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} className="exam-btn-primary">التالي →</button>
              ) : (
                <button onClick={submitExam} disabled={submitting}
                  className="exam-btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  إنهاء الاختبار
                </button>
              )}
            </div>

            {/* Answer progress */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${i === current ? 'bg-indigo-500 text-white' : answers[questions[i].id] ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === 'submitted' && (
          <div className="exam-card p-10 text-center animate-fade-in">
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${passed ? 'text-yellow-400' : 'text-gray-300'}`} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {passed ? '🎉 تهانينا!' : 'انتهى الاختبار'}
            </h2>
            {exam?.show_results && (
              <>
                <div className={`text-6xl font-black my-6 ${passed ? 'text-emerald-500' : 'text-red-400'}`}>{score}%</div>
                <div className={`exam-badge text-sm py-2 px-4 ${passed ? 'exam-badge-success' : 'exam-badge-danger'}`}>
                  {passed ? '✓ ناجح' : '✗ لم يتجاوز الحد الأدنى'}
                </div>
                <p className="text-gray-500 text-sm mt-4">درجة النجاح المطلوبة: {exam.passing_score}%</p>
              </>
            )}
            {!exam?.show_results && (
              <p className="text-gray-500 text-sm mt-4">تم إرسال إجاباتك بنجاح. ستعلمك النتيجة لاحقاً.</p>
            )}
            <p className="text-gray-400 text-xs mt-6">شكراً {name} على إكمال الاختبار</p>
          </div>
        )}
      </div>
    </div>
  );
}
