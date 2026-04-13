"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Eye, Loader2, AlertCircle, CheckCircle, Globe, Lock } from 'lucide-react';

export default function EditExamPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [exam, setExam] = useState({ title:'', subject:'', description:'', duration_minutes:30, passing_score:50, max_attempts:1, status:'draft', shuffle_questions:false, show_results:true });

  useEffect(() => {
    (async () => {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s = await createSPASaaSClientAuthenticated();
      const { data } = await s.getSupabaseClient().from('exams').select('*').eq('id', id).single();
      if (data) setExam({ title: data.title||'', subject: data.subject||'', description: data.description||'',
        duration_minutes: data.duration_minutes||30, passing_score: data.passing_score||50,
        max_attempts: data.max_attempts||1, status: data.status||'draft',
        shuffle_questions: data.shuffle_questions||false, show_results: data.show_results!==false });
      setLoading(false);
    })();
  }, [id]);

  const save = async (newStatus?: string) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s = await createSPASaaSClientAuthenticated();
      const { error: e } = await s.getSupabaseClient().from('exams')
        .update({ ...exam, status: newStatus||exam.status, updated_at: new Date().toISOString() }).eq('id', id);
      if (e) throw e;
      if (newStatus) setExam(ex => ({...ex, status: newStatus}));
      setSuccess('تم الحفظ بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch(e){ setError(e instanceof Error ? e.message : 'خطأ'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-indigo-400"/></div>;

  return (
    <div className="max-w-2xl animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">تعديل الاختبار</h1>
        <div className="flex items-center gap-2">
          <span className={`exam-badge ${exam.status==='published'?'exam-badge-success':'exam-badge-warning'}`}>
            {exam.status==='published'?<Globe className="h-3 w-3"/>:<Lock className="h-3 w-3"/>}
            {exam.status==='published'?'منشور':'مسودة'}
          </span>
        </div>
      </div>

      {error   && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"><AlertCircle className="h-4 w-4"/>{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm"><CheckCircle className="h-4 w-4"/>{success}</div>}

      <div className="exam-card p-6 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label><input className="exam-input" value={exam.title} onChange={e=>setExam(ex=>({...ex,title:e.target.value}))}/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">المادة</label><input className="exam-input" value={exam.subject} onChange={e=>setExam(ex=>({...ex,subject:e.target.value}))}/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">المدة (دقيقة)</label><input type="number" className="exam-input" value={exam.duration_minutes} onChange={e=>setExam(ex=>({...ex,duration_minutes:Number(e.target.value)}))}/></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><textarea className="exam-input resize-none" rows={2} value={exam.description} onChange={e=>setExam(ex=>({...ex,description:e.target.value}))}/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">درجة النجاح (%)</label><input type="number" className="exam-input" value={exam.passing_score} onChange={e=>setExam(ex=>({...ex,passing_score:Number(e.target.value)}))}/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">عدد المحاولات</label><input type="number" className="exam-input" value={exam.max_attempts} onChange={e=>setExam(ex=>({...ex,max_attempts:Number(e.target.value)}))}/></div>
        </div>
        {[{label:'خلط الأسئلة',key:'shuffle_questions'},{label:'إظهار النتيجة للطالب',key:'show_results'}].map((t,i)=>(
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-700">{t.label}</span>
            <button type="button" onClick={()=>setExam(ex=>({...ex,[t.key]:!ex[t.key as keyof typeof ex]}))}
              className={`relative w-10 h-5 rounded-full transition-colors ${(exam as Record<string,unknown>)[t.key]?'bg-indigo-500':'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(exam as Record<string,unknown>)[t.key]?'right-0.5':'left-0.5'}`}/>
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={()=>router.back()} className="exam-btn-secondary">رجوع</button>
        <button onClick={()=>save()} disabled={saving} className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}حفظ
        </button>
        <button onClick={()=>save(exam.status==='published'?'draft':'published')} disabled={saving} className="flex-1 exam-btn-primary justify-center disabled:opacity-50">
          {exam.status==='published'?<><Lock className="h-4 w-4"/>إلغاء النشر</>:<><Eye className="h-4 w-4"/>نشر</>}
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={()=>router.push(`/app/teacher/exams/${id}/invite`)} className="flex-1 exam-btn-secondary justify-center">
          دعوة الطلاب
        </button>
      </div>
    </div>
  );
}
