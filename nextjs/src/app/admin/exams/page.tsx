"use client";
import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Eye, Trash2, Globe, Lock, Clock, Users } from 'lucide-react';

interface Exam { id:string; title:string; subject:string; status:string; duration_minutes:number; invite_code:string; created_at:string; profiles:{email:string;full_name:string|null}; }

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
        const s = await createSPASaaSClientAuthenticated();
        const { data } = await s.getSupabaseClient()
          .from('exams').select('*, profiles!inner(email, full_name)')
          .order('created_at', { ascending: false });
        setExams((data||[]) as Exam[]);
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const deleteExam = async (id: string) => {
    if (!confirm('حذف هذا الاختبار؟')) return;
    const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
    const s = await createSPASaaSClientAuthenticated();
    await s.getSupabaseClient().from('exams').delete().eq('id', id);
    setExams(e => e.filter(x => x.id !== id));
  };

  const filtered = exams.filter(e => {
    const ms = e.title.includes(search) || e.profiles?.email?.includes(search);
    const mst = statusFilter === 'all' || e.status === statusFilter;
    return ms && mst;
  });

  const sC: Record<string,string> = {draft:'exam-badge-warning',published:'exam-badge-success',closed:'exam-badge-danger',archived:'bg-gray-100 text-gray-500'};
  const sL: Record<string,string> = {draft:'مسودة',published:'منشور',closed:'مغلق',archived:'مؤرشف'};

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-gray-900">جميع الاختبارات</h1><p className="text-gray-500 text-sm mt-1">إدارة كل اختبارات المنصة</p></div>

      <div className="grid grid-cols-4 gap-3">
        {[['الكل',exams.length,'text-gray-600'],['منشور',exams.filter(e=>e.status==='published').length,'text-emerald-600'],['مسودة',exams.filter(e=>e.status==='draft').length,'text-amber-600'],['مغلق',exams.filter(e=>e.status==='closed').length,'text-red-500']].map(([l,v,c],i)=>(
          <div key={i} className="stat-card text-center py-4"><div className={`text-2xl font-bold ${c}`}>{v}</div><div className="text-xs text-gray-400">{l}</div></div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><input className="exam-input pr-9" placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select className="exam-input w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">الكل</option><option value="published">منشور</option><option value="draft">مسودة</option><option value="closed">مغلق</option>
        </select>
      </div>

      <div className="exam-card overflow-hidden">
        {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/></div>
        : <table className="w-full">
          <thead><tr className="bg-gray-50">{['الاختبار','المعلم','الحالة','المدة','الإجراءات'].map(h=><th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(e=>(
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><div><p className="text-sm font-medium text-gray-900">{e.title}</p><p className="text-xs text-gray-400">{e.subject||'—'}</p></div></td>
                <td className="px-4 py-3 text-xs text-gray-500">{e.profiles?.full_name||e.profiles?.email}</td>
                <td className="px-4 py-3"><span className={`exam-badge text-xs ${sC[e.status]}`}>{e.status==='published'?<Globe className="h-3 w-3"/>:<Lock className="h-3 w-3"/>}{sL[e.status]}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3"/>{e.duration_minutes}د</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {e.invite_code&&<a href={`/exam/${e.invite_code}`} target="_blank" className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"><Eye className="h-4 w-4"/></a>}
                    <button onClick={()=>deleteExam(e.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">لا توجد اختبارات</td></tr>}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
