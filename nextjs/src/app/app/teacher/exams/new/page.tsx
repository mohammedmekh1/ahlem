"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Wand2, Plus, Trash2, Save, Eye, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

type QType = 'mcq' | 'true_false' | 'short_answer';
interface Q { id: string; question_text: string; question_type: QType; options: string[]; correct_answer: string; points: number; explanation: string; }

const mkQ = (): Q => ({ id: Math.random().toString(36).slice(2), question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', points: 1, explanation: '' });

export default function NewExamPage() {
  const router = useRouter();
  const { user } = useGlobal();
  const [step, setStep] = useState<1|2|3>(1);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(50);
  const [shuffle, setShuffle] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [questions, setQuestions] = useState<Q[]>([mkQ()]);
  const [aiSubject, setAiSubject] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState<QType>('mcq');
  const [aiDifficulty, setAiDifficulty] = useState('متوسط');
  const [aiNotes, setAiNotes] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);

  const addQ = () => setQuestions(q => [...q, mkQ()]);
  const removeQ = (id: string) => setQuestions(q => q.filter(x => x.id !== id));
  const updateQ = (id: string, patch: Partial<Q>) => setQuestions(q => q.map(x => x.id === id ? { ...x, ...patch } : x));

  const generateWithAI = async () => {
    if (!aiSubject.trim()) { setError('أدخل الموضوع'); return; }
    setAiLoading(true); setError('');
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: aiSubject, count: aiCount, type: aiType, difficulty: aiDifficulty, notes: aiNotes }),
      });
      if (!res.ok) throw new Error('فشل التوليد');
      const data = await res.json();
      const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      const newQs: Q[] = (parsed.questions || []).map((q: Record<string,unknown>) => ({
        id: Math.random().toString(36).slice(2),
        question_text: String(q.question_text || ''),
        question_type: (q.question_type as QType) || aiType,
        options: Array.isArray(q.options) ? q.options as string[] : ['صح', 'خطأ'],
        correct_answer: String(q.correct_answer || ''),
        explanation: String(q.explanation || ''),
        points: Number(q.points || 1),
      }));
      setQuestions(prev => [...prev.filter(q => q.question_text.trim()), ...newQs]);
      setSuccess(`✓ تم توليد ${newQs.length} أسئلة`);
      setShowAiPanel(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) { setError(e instanceof Error ? e.message : 'خطأ'); }
    finally { setAiLoading(false); }
  };

  const saveExam = async (status: 'draft'|'published') => {
    if (!title.trim()) { setError('العنوان مطلوب'); return; }
    const validQs = questions.filter(q => q.question_text.trim());
    if (validQs.length === 0) { setError('أضف سؤالاً على الأقل'); return; }
    setSaving(true); setError('');
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();
      const { data: code } = await db.rpc('generate_exam_invite_code');
      const { data: exam, error: eErr } = await db.from('exams').insert({
        title, subject, description, teacher_id: user!.id,
        duration_minutes: duration, max_attempts: maxAttempts,
        passing_score: passingScore, status, invite_code: code as string,
        shuffle_questions: shuffle, show_results: showResults, allow_anonymous: true,
      }).select().single();
      if (eErr) throw eErr;
      await db.from('questions').insert(validQs.map((q, i) => ({
        exam_id: exam.id, question_text: q.question_text, question_type: q.question_type,
        options: q.options.filter(Boolean), correct_answer: q.correct_answer,
        explanation: q.explanation, points: q.points, order_index: i,
      })));
      router.push('/app/teacher/exams');
    } catch (e) { setError(e instanceof Error ? e.message : 'فشل الحفظ'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إنشاء اختبار جديد</h1>
        <div className="flex items-center gap-2">
          {[1,2,3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s ? 'bg-indigo-500 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {error   && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-4"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm mb-4"><CheckCircle className="h-4 w-4 shrink-0" />{success}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <div className="exam-card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">معلومات الاختبار</h2>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label><input className="exam-input" placeholder="اختبار الرياضيات — الفصل الثالث" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">المادة</label><input className="exam-input" placeholder="رياضيات، فيزياء..." value={subject} onChange={e => setSubject(e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">المدة (دقيقة)</label><input type="number" className="exam-input" min={5} max={300} value={duration} onChange={e => setDuration(Number(e.target.value))} /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><textarea className="exam-input resize-none" rows={2} placeholder="وصف اختياري..." value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <div className="exam-card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">الإعدادات</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">عدد المحاولات</label><input type="number" className="exam-input" min={1} max={10} value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">درجة النجاح (%)</label><input type="number" className="exam-input" min={0} max={100} value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} /></div>
            </div>
            {[['خلط ترتيب الأسئلة', shuffle, setShuffle],['إظهار النتيجة للطالب', showResults, setShowResults]].map(([lbl, val, set], i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <button type="button" onClick={() => (set as (v: boolean) => void)(!(val as boolean))} className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'right-0.5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700">{String(lbl)}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={() => { if (!title.trim()) { setError('العنوان مطلوب'); return; } setError(''); setStep(2); }} className="exam-btn-primary">التالي: الأسئلة →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="exam-card overflow-hidden">
            <button onClick={() => setShowAiPanel(!showAiPanel)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><Wand2 className="h-5 w-5 text-white" /></div>
                <div className="text-right"><p className="font-semibold text-sm">توليد بالذكاء الاصطناعي</p><p className="text-xs text-gray-400">حدد الموضوع ودعنا نولّد الأسئلة</p></div>
              </div>
              {showAiPanel ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {showAiPanel && (
              <div className="p-4 border-t border-gray-100 bg-indigo-50/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">الموضوع *</label><input className="exam-input text-sm" placeholder="الكسور العشرية" value={aiSubject} onChange={e => setAiSubject(e.target.value)} /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">عدد الأسئلة</label><select className="exam-input text-sm" value={aiCount} onChange={e => setAiCount(Number(e.target.value))}>{[3,5,8,10,15].map(n=><option key={n} value={n}>{n} أسئلة</option>)}</select></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">النوع</label><select className="exam-input text-sm" value={aiType} onChange={e => setAiType(e.target.value as QType)}><option value="mcq">اختيار من متعدد</option><option value="true_false">صح أو خطأ</option><option value="short_answer">إجابة قصيرة</option></select></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">الصعوبة</label><select className="exam-input text-sm" value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)}><option>سهل</option><option>متوسط</option><option>صعب</option></select></div>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">ملاحظات</label><textarea className="exam-input resize-none text-sm" rows={2} placeholder="تعليمات خاصة للذكاء الاصطناعي..." value={aiNotes} onChange={e => setAiNotes(e.target.value)} /></div>
                <button onClick={generateWithAI} disabled={aiLoading} className="exam-btn-primary disabled:opacity-50">
                  {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" />جاري التوليد...</> : <><Wand2 className="h-4 w-4" />توليد الأسئلة</>}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="exam-card overflow-hidden">
                <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-right">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">{idx+1}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{q.question_text || 'سؤال جديد...'}</span>
                  <span className="exam-badge exam-badge-primary text-xs">{q.points}ن</span>
                  {expanded === q.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {expanded === q.id && (
                  <div className="p-4 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-medium text-gray-600 mb-1">النوع</label><select className="exam-input text-sm" value={q.question_type} onChange={e => updateQ(q.id, {question_type: e.target.value as QType})}><option value="mcq">اختيار من متعدد</option><option value="true_false">صح أو خطأ</option><option value="short_answer">إجابة قصيرة</option></select></div>
                      <div><label className="block text-xs font-medium text-gray-600 mb-1">النقاط</label><input type="number" className="exam-input text-sm" min={1} value={q.points} onChange={e => updateQ(q.id, {points: Number(e.target.value)})} /></div>
                    </div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">السؤال *</label><textarea className="exam-input resize-none text-sm" rows={2} value={q.question_text} onChange={e => updateQ(q.id, {question_text: e.target.value})} /></div>
                    {q.question_type === 'mcq' && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-600">الخيارات (انقر الدائرة لتحديد الصحيح)</label>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button type="button" onClick={() => updateQ(q.id, {correct_answer: opt})} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.correct_answer === opt ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>{q.correct_answer === opt && <span className="w-2 h-2 bg-white rounded-full" />}</button>
                            <input className="exam-input text-sm flex-1" placeholder={`الخيار ${['أ','ب','ج','د'][oi]}`} value={opt} onChange={e => { const o=[...q.options]; o[oi]=e.target.value; updateQ(q.id, {options: o}); }} />
                          </div>
                        ))}
                      </div>
                    )}
                    {q.question_type === 'true_false' && (
                      <div><label className="block text-xs font-medium text-gray-600 mb-1">الإجابة</label>
                      <div className="flex gap-2">{['صح','خطأ'].map(v => (<button key={v} type="button" onClick={() => updateQ(q.id, {correct_answer: v})} className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${q.correct_answer === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>{v}</button>))}</div></div>
                    )}
                    {q.question_type === 'short_answer' && (
                      <div><label className="block text-xs font-medium text-gray-600 mb-1">الإجابة النموذجية</label><input className="exam-input text-sm" value={q.correct_answer} onChange={e => updateQ(q.id, {correct_answer: e.target.value})} /></div>
                    )}
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">شرح (اختياري)</label><input className="exam-input text-sm" value={q.explanation} onChange={e => updateQ(q.id, {explanation: e.target.value})} /></div>
                    <button onClick={() => removeQ(q.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" />حذف</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={addQ} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"><Plus className="h-4 w-4" />إضافة سؤال</button>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="exam-btn-secondary">← السابق</button>
            <button onClick={() => { if (!questions.some(q=>q.question_text.trim())) { setError('أضف سؤالاً'); return; } setError(''); setStep(3); }} className="exam-btn-primary">التالي: مراجعة →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="exam-card p-6">
            <h2 className="font-semibold text-gray-800 mb-4">مراجعة الاختبار</h2>
            <div className="space-y-2 text-sm">
              {[['العنوان', title],['المادة', subject||'—'],['المدة', `${duration} دقيقة`],['الأسئلة', questions.filter(q=>q.question_text.trim()).length],['النجاح', `${passingScore}%`],['المحاولات', maxAttempts]].map(([k,v])=>(
                <div key={k as string} className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="exam-btn-secondary">← السابق</button>
            <button onClick={() => saveExam('draft')} disabled={saving} className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}حفظ مسودة
            </button>
            <button onClick={() => saveExam('published')} disabled={saving} className="flex-1 exam-btn-primary justify-center disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}نشر الاختبار
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
