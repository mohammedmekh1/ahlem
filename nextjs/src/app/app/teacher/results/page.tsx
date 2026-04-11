"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { BarChart3, Download, Search, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface Session { id: string; student_name: string; student_email: string; score: number | null; passed: boolean | null; status: string; started_at: string; submitted_at: string | null; exams: { title: string; passing_score: number; }; }

export default function TeacherResultsPage() {
  const { user } = useGlobal();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const load = useCallback(async () => {
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s  = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();
      const { data } = await db
        .from('exam_sessions')
        .select('*, exams!inner(title, passing_score, teacher_id)')
        .eq('exams.teacher_id', user?.id)
        .order('started_at', { ascending: false });
      setSessions((data || []) as Session[]);
    } catch (e) { console.error(e); }
    finally    { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { if (user?.id) load(); }, [user?.id, load]);

  const filtered = sessions.filter(s =>
    s.student_name.includes(search) || s.student_email.includes(search) ||
    s.exams?.title?.includes(search)
  );

  const stats = {
    total:   sessions.length,
    passed:  sessions.filter(s => s.passed === true).length,
    failed:  sessions.filter(s => s.passed === false).length,
    avg:     sessions.filter(s => s.score !== null).length > 0
      ? Math.round(sessions.filter(s => s.score !== null).reduce((a, s) => a + (s.score || 0), 0) / sessions.filter(s => s.score !== null).length)
      : 0,
  };

  const exportCSV = () => {
    const rows = [['الاسم','الإيميل','الاختبار','الدرجة','النتيجة','الوقت'],
      ...filtered.map(s => [s.student_name, s.student_email, s.exams?.title, s.score ?? '—', s.passed ? 'ناجح' : 'راسب', s.submitted_at ? new Date(s.submitted_at).toLocaleString('ar') : '—'])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csv);
    a.download = 'نتائج_الاختبارات.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">نتائج الطلاب</h1><p className="text-gray-500 text-sm mt-1">أرشيف جميع جلسات الاختبار</p></div>
        <button onClick={exportCSV} className="exam-btn-secondary"><Download className="h-4 w-4" />تصدير CSV</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الجلسات', value: stats.total,  icon: Users,       color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'ناجحون',         value: stats.passed,  icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'راسبون',         value: stats.failed,  icon: XCircle,     color: 'text-red-400', bg: 'bg-red-50' },
          { label: 'متوسط الدرجات', value: `${stats.avg}%`, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div><div className="text-2xl font-bold text-gray-900">{s.value}</div><div className="text-xs text-gray-400">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input className="exam-input pr-9" placeholder="ابحث باسم الطالب أو الاختبار..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="exam-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              {['الطالب','الاختبار','الدرجة','النتيجة','الحالة','الوقت'].map(h => (
                <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.student_name}</p>
                      <p className="text-xs text-gray-400">{s.student_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.exams?.title}</td>
                  <td className="px-4 py-3">
                    {s.score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="exam-progress w-16" style={{height:'4px'}}><div className="exam-progress-bar" style={{width:`${s.score}%`}} /></div>
                        <span className="text-sm font-bold text-gray-700">{s.score}%</span>
                      </div>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {s.passed === null ? <span className="text-gray-400 text-sm">—</span> :
                      <span className={`exam-badge ${s.passed ? 'exam-badge-success' : 'exam-badge-danger'}`}>
                        {s.passed ? '✓ ناجح' : '✗ راسب'}
                      </span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`exam-badge ${s.status === 'submitted' ? 'exam-badge-success' : s.status === 'expired' ? 'exam-badge-danger' : 'exam-badge-warning'}`}>
                      {s.status === 'submitted' ? 'مكتمل' : s.status === 'expired' ? 'منتهي' : 'جارٍ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('ar-DZ') : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">لا توجد نتائج</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
