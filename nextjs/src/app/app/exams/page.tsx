"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, Trophy, ChevronRight, Play, RotateCcw, Search, ExternalLink } from 'lucide-react';

interface Session {
  id: string; score: number | null; passed: boolean | null; status: string;
  started_at: string; submitted_at: string | null;
  exams: { id: string; title: string; subject: string; duration_minutes: number; invite_code: string; passing_score: number; };
}

export default function StudentExamsPage() {
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<'all'|'completed'|'available'>('all');
  const [search,    setSearch]    = useState('');

  const load = useCallback(async () => {
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s  = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;
      // Get student sessions
      const { data } = await db
        .from('exam_sessions')
        .select('*, exams!inner(id, title, subject, duration_minutes, invite_code, passing_score)')
        .eq('student_id', user.id)
        .order('started_at', { ascending: false });
      setSessions((data || []) as Session[]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = sessions.filter(s => {
    const ms = s.exams?.title?.includes(search) || s.exams?.subject?.includes(search);
    if (activeTab === 'completed') return ms && s.status === 'submitted';
    return ms;
  });

  const stats = {
    total:  sessions.length,
    passed: sessions.filter(s => s.passed === true).length,
    avg:    sessions.filter(s => s.score !== null).length > 0
      ? Math.round(sessions.reduce((a,s) => a + (s.score||0), 0) / sessions.filter(s=>s.score!==null).length)
      : 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">اختباراتي</h1>
        <p className="text-gray-500 text-sm mt-1">سجل جميع اختباراتك ونتائجها</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'الاختبارات المكتملة', value: stats.total,  color:'text-indigo-500', bg:'bg-indigo-50' },
          { label:'الناجحة',             value: stats.passed, color:'text-emerald-500', bg:'bg-emerald-50' },
          { label:'متوسط الدرجات',       value: `${stats.avg}%`, color:'text-purple-500', bg:'bg-purple-50' },
        ].map((s,i) => (
          <div key={i} className="stat-card text-center py-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <input className="exam-input pr-9" placeholder="ابحث عن اختبار..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2">
          {[['all','الكل'],['completed','المكتملة']].map(([k,l]) => (
            <button key={k} onClick={() => setActiveTab(k as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab===k?'bg-indigo-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="exam-card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-3"/>
          <h3 className="text-gray-500 font-medium">لم تؤدِ أي اختبار بعد</h3>
          <p className="text-sm text-gray-400 mt-1">احصل على رابط اختبار من معلمك وابدأ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s,i) => (
            <div key={s.id} className="exam-card p-4 flex items-center gap-4 animate-fade-in" style={{animationDelay:`${i*.05}s`}}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.status==='submitted' ? (s.passed?'bg-emerald-50':'bg-red-50') : 'bg-indigo-50'}`}>
                {s.status==='submitted'
                  ? (s.passed ? <Trophy className="h-6 w-6 text-emerald-500"/> : <XCircle className="h-6 w-6 text-red-400"/>)
                  : <AlertCircle className="h-6 w-6 text-indigo-500"/>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{s.exams?.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  {s.exams?.subject && <span>{s.exams.subject}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{s.exams?.duration_minutes} دقيقة</span>
                  <span>{new Date(s.started_at).toLocaleDateString('ar-DZ')}</span>
                </div>
                {s.status === 'submitted' && s.score !== null && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="exam-progress w-24" style={{height:'5px'}}>
                      <div className="exam-progress-bar" style={{width:`${s.score}%`}}/>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{s.score}%</span>
                    <span className={`exam-badge text-xs ${s.passed?'exam-badge-success':'exam-badge-danger'}`}>
                      {s.passed ? '✓ ناجح' : '✗ راسب'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {s.exams?.invite_code && (
                  <a href={`/exam/${s.exams.invite_code}`} target="_blank"
                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="فتح الاختبار">
                    <ExternalLink className="h-4 w-4"/>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="exam-card p-4 bg-indigo-50 border-indigo-100">
        <p className="text-sm text-indigo-700 font-medium">💡 لدخول اختبار جديد</p>
        <p className="text-xs text-indigo-500 mt-1">احصل على رابط الاختبار من معلمك — لا تحتاج تسجيل دخول لأداء الاختبار</p>
      </div>
    </div>
  );
}
