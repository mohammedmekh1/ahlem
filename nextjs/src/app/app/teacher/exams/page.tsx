"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGlobal } from '@/lib/context/GlobalContext';
import { PlusCircle, ClipboardList, Users, Clock, Eye, Edit, Trash2, Copy, Check, ExternalLink, BarChart2, Globe, Lock } from 'lucide-react';

interface Exam {
  id: string; title: string; subject: string; status: string;
  duration_minutes: number; invite_code: string; created_at: string;
  _count?: { sessions: number };
}

export default function TeacherExamsPage() {
  const { user } = useGlobal();
  const [exams,   setExams]   = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s = await createSPASaaSClientAuthenticated();
      const { data } = await s.getSupabaseClient()
        .from('exams')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });
      setExams(data || []);
    } catch (e) { console.error(e); }
    finally    { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { if (user?.id) load(); }, [user?.id, load]);

  const deleteExam = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
    const s = await createSPASaaSClientAuthenticated();
    await s.getSupabaseClient().from('exams').delete().eq('id', id);
    load();
  };

  const copyLink = async (code: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/exam/${code}`);
    setCopied(code); setTimeout(() => setCopied(null), 2000);
  };

  const statusBadge: Record<string, string> = {
    draft:     'exam-badge-warning',
    published: 'exam-badge-success',
    closed:    'exam-badge-danger',
    archived:  'bg-gray-100 text-gray-600',
  };
  const statusLabel: Record<string, string> = {
    draft: 'مسودة', published: 'منشور', closed: 'مغلق', archived: 'مؤرشف'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">اختباراتي</h1>
          <p className="text-gray-500 text-sm mt-1">إنشاء وإدارة جميع اختباراتك</p>
        </div>
        <Link href="/app/teacher/exams/new" className="exam-btn-primary">
          <PlusCircle className="h-4 w-4" /> اختبار جديد
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الاختبارات', value: exams.length, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'منشورة',            value: exams.filter(e => e.status === 'published').length, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'مسودة',             value: exams.filter(e => e.status === 'draft').length,     color: 'text-amber-500',   bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <ClipboardList className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : exams.length === 0 ? (
        <div className="exam-card p-16 text-center">
          <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium">لا توجد اختبارات بعد</h3>
          <p className="text-sm text-gray-400 mt-1 mb-6">أنشئ اختبارك الأول الآن</p>
          <Link href="/app/teacher/exams/new" className="exam-btn-primary">
            <PlusCircle className="h-4 w-4" /> إنشاء اختبار
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        {exam.subject && <span>{exam.subject}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration_minutes} دقيقة</span>
                        <span>{new Date(exam.created_at).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                    <span className={`exam-badge ${statusBadge[exam.status]} shrink-0`}>
                      {exam.status === 'published' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {statusLabel[exam.status]}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Link href={`/app/teacher/exams/${exam.id}/edit`}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Edit className="h-3.5 w-3.5" /> تعديل
                    </Link>
                    <Link href={`/app/teacher/results?exam=${exam.id}`}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      <BarChart2 className="h-3.5 w-3.5" /> النتائج
                    </Link>
                    {exam.invite_code && (
                      <>
                        <button onClick={() => copyLink(exam.invite_code)}
                          className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                          {copied === exam.invite_code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied === exam.invite_code ? 'تم النسخ' : 'نسخ الرابط'}
                        </button>
                        <a href={`/exam/${exam.invite_code}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> معاينة
                        </a>
                      </>
                    )}
                    <button onClick={() => deleteExam(exam.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors mr-auto">
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
