"use client";
import React, { useState } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, Trophy, ChevronRight, Play, RotateCcw } from 'lucide-react';

type ExamStatus = 'available' | 'completed' | 'in-progress' | 'locked';

interface Exam {
  id: number; title: string; subject: string; questions: number;
  duration: number; score?: number; maxScore: number; status: ExamStatus;
  dueDate?: string; attempts: number; maxAttempts: number;
}

const exams: Exam[] = [
  { id: 1, title: 'اختبار الرياضيات - الوحدة 3', subject: 'رياضيات', questions: 30, duration: 45, score: 92, maxScore: 100, status: 'completed',    attempts: 1, maxAttempts: 3 },
  { id: 2, title: 'اختبار الفيزياء - الطاقة',    subject: 'علوم',    questions: 25, duration: 30, score: 78, maxScore: 100, status: 'completed',    attempts: 2, maxAttempts: 3 },
  { id: 3, title: 'اختبار البرمجة - Python',      subject: 'تقنية',   questions: 40, duration: 60,            maxScore: 100, status: 'available',    dueDate: 'غداً', attempts: 0, maxAttempts: 2 },
  { id: 4, title: 'اختبار الكيمياء الشامل',      subject: 'علوم',    questions: 35, duration: 50,            maxScore: 100, status: 'available',    dueDate: 'بعد 3 أيام', attempts: 0, maxAttempts: 1 },
  { id: 5, title: 'اختبار الإحصاء التطبيقي',    subject: 'رياضيات', questions: 20, duration: 25,            maxScore: 100, status: 'in-progress',  attempts: 0, maxAttempts: 2 },
  { id: 6, title: 'اختبار التاريخ الشامل',       subject: 'إنسانيات',questions: 50, duration: 90,            maxScore: 100, status: 'locked',       attempts: 0, maxAttempts: 1 },
];

const statusConfig: Record<ExamStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
  available:    { label: 'متاح',      badgeClass: 'exam-badge-primary', icon: ClipboardList },
  completed:    { label: 'مكتمل',     badgeClass: 'exam-badge-success', icon: CheckCircle },
  'in-progress':{ label: 'جارٍ',       badgeClass: 'exam-badge-warning', icon: AlertCircle },
  locked:       { label: 'مقفول',     badgeClass: 'exam-badge-danger',  icon: XCircle },
};

// ─── QUIZ MODAL ───
function QuizModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers,  setAnswers]  = useState<(number | null)[]>(Array(3).fill(null));
  const [finished, setFinished] = useState(false);

  const questions = [
    { q: 'ما هي قيمة π بالتقريب؟',         options: ['3.14', '2.71', '1.41', '1.73'], correct: 0 },
    { q: 'ما هو الجذر التربيعي لـ 144؟',    options: ['10', '12', '14', '16'],         correct: 1 },
    { q: 'ما ناتج 7 × 8؟',                  options: ['54', '56', '64', '48'],         correct: 1 },
  ];

  const handleSelect = (idx: number) => setSelected(idx);
  const handleNext = () => {
    const upd = [...answers]; upd[current] = selected; setAnswers(upd);
    if (current < questions.length - 1) { setCurrent(c => c + 1); setSelected(null); }
    else setFinished(true);
  };
  const score = Math.round(answers.filter((a, i) => a === questions[i]?.correct).length / questions.length * 100);

  if (finished) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="exam-card w-full max-w-md p-8 text-center animate-fade-in">
        <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اكتمل الاختبار!</h2>
        <div className="text-5xl font-bold text-indigo-600 my-6">{score}%</div>
        <p className="text-gray-500 mb-6">{score >= 80 ? 'أداء ممتاز! 🎉' : score >= 60 ? 'جيد، استمر في التطور' : 'حاول مرة أخرى للتحسين'}</p>
        <button onClick={onClose} className="exam-btn-primary w-full justify-center">إغلاق</button>
      </div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="exam-card w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">سؤال {current + 1} من {questions.length}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">إلغاء</button>
        </div>
        <div className="exam-progress mb-6">
          <div className="exam-progress-bar" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{q.q}</h3>
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(i)}
              className={`quiz-option w-full text-right ${selected === i ? 'selected' : ''}`}>
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${selected === i ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          ))}
        </div>
        <button onClick={handleNext} disabled={selected === null}
          className="exam-btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
          {current === questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ExamsPage() {
  const [activeTab, setActiveTab]   = useState<'all' | 'available' | 'completed'>('all');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  const filtered = exams.filter(e => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return e.status === 'available' || e.status === 'in-progress';
    return e.status === 'completed';
  });

  const stats = {
    completed: exams.filter(e => e.status === 'completed').length,
    available: exams.filter(e => e.status === 'available').length,
    avg: Math.round(exams.filter(e => e.score).reduce((s, e) => s + (e.score || 0), 0) / exams.filter(e => e.score).length),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {activeExam && <QuizModal exam={activeExam} onClose={() => setActiveExam(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الاختبارات</h1>
          <p className="text-gray-500 text-sm mt-1">تابع وأدِر جميع اختباراتك</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'مكتملة',   value: stats.completed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'متاحة',    value: stats.available, icon: ClipboardList,color: 'text-indigo-500',  bg: 'bg-indigo-50' },
          { label: 'متوسط الدرجات', value: `${stats.avg}%`, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        ].map((s, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[['all','الكل'],['available','المتاحة'],['completed','المكتملة']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Exam List */}
      <div className="space-y-3">
        {filtered.map((e, i) => {
          const cfg = statusConfig[e.status];
          return (
            <div key={e.id} className="exam-card p-4 flex items-center gap-4 hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${e.status === 'completed' ? 'bg-emerald-50' : e.status === 'locked' ? 'bg-gray-50' : 'bg-indigo-50'}`}>
                <cfg.icon className={`h-6 w-6 ${e.status === 'completed' ? 'text-emerald-500' : e.status === 'locked' ? 'text-gray-300' : 'text-indigo-500'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{e.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{e.subject}</span>
                      <span>{e.questions} سؤال</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{e.duration} دقيقة</span>
                      {e.dueDate && <span className="text-orange-500">الموعد: {e.dueDate}</span>}
                    </div>
                  </div>
                  <span className={`exam-badge ${cfg.badgeClass} shrink-0`}>{cfg.label}</span>
                </div>

                {e.status === 'completed' && e.score !== undefined && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="exam-progress flex-1" style={{ height: '6px' }}>
                      <div className="exam-progress-bar" style={{ width: `${e.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-indigo-600">{e.score}%</span>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                {e.status === 'available' && (
                  <button onClick={() => setActiveExam(e)} className="exam-btn-primary text-xs py-2 px-3">
                    <Play className="h-3.5 w-3.5 fill-white" /> ابدأ
                  </button>
                )}
                {e.status === 'in-progress' && (
                  <button onClick={() => setActiveExam(e)} className="exam-btn-primary text-xs py-2 px-3 bg-orange-500 from-orange-500 to-amber-500">
                    <RotateCcw className="h-3.5 w-3.5" /> متابعة
                  </button>
                )}
                {e.status === 'completed' && e.attempts < e.maxAttempts && (
                  <button onClick={() => setActiveExam(e)} className="exam-btn-secondary text-xs py-2 px-3">
                    <RotateCcw className="h-3.5 w-3.5" /> إعادة
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
