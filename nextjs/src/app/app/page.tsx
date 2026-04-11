"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useGlobal, isTeacher, isAdmin } from '@/lib/context/GlobalContext';
import Link from 'next/link';
import {
  BookOpen, ClipboardList, Brain, BarChart3, TrendingUp, Clock,
  Award, ChevronRight, ArrowUpRight, Activity, PlusCircle,
  Users, Database, Zap, Trophy
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface TeacherStats { total_exams:number; published_exams:number; total_sessions:number; avg_score:number; pass_rate:number; }
interface RecentSession { id:string; student_name:string; score:number|null; passed:boolean|null; submitted_at:string; exams:{ title:string }; }

export default function DashboardPage() {
  const { user, loading } = useGlobal();
  const [tStats,   setTStats]   = useState<TeacherStats | null>(null);
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadTeacherData = useCallback(async () => {
    if (!user?.id || !isTeacher(user)) return;
    setDataLoading(true);
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s  = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();
      const [{ data: st }, { data: sess }] = await Promise.all([
        db.rpc('get_teacher_stats', { p_teacher_id: user.id }),
        db.from('exam_sessions').select('id,student_name,score,passed,submitted_at,exams!inner(title,teacher_id)')
          .eq('exams.teacher_id', user.id).eq('status','submitted')
          .order('submitted_at',{ascending:false}).limit(5),
      ]);
      if (st) setTStats(st as TeacherStats);
      setSessions((sess||[]) as RecentSession[]);
    } catch(e){ console.error(e); }
    finally { setDataLoading(false); }
  }, [user]);

  useEffect(() => { loadTeacherData(); }, [loadTeacherData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  const username = user?.full_name || user?.email?.split('@')[0] || 'مستخدم';
  const roleGreet: Record<string,string> = {
    owner:'مرحباً أيها المالك 👑', admin:'مرحباً أيها المشرف 🛡️',
    teacher:'مرحباً أستاذ 📚', student:'أهلاً وسهلاً 🎓'
  };

  // ── Admin / Owner view ──
  if (isAdmin(user)) return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
        <div className="relative z-10">
          <p className="text-purple-200 text-sm mb-1">{roleGreet[user!.role]}</p>
          <h1 className="text-2xl font-bold">{username}</h1>
          <p className="text-purple-200 text-sm mt-1">لديك صلاحيات إدارة المنصة الكاملة</p>
          <div className="flex gap-3 mt-4">
            <Link href="/admin" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1"><Users className="h-4 w-4" />لوحة الإدارة</Link>
            <Link href="/admin/seed" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1"><Database className="h-4 w-4" />بيانات تجريبية</Link>
          </div>
        </div>
        <Award className="absolute right-6 top-1/2 -translate-y-1/2 h-24 w-24 text-white/10" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'المستخدمون', href:'/admin', icon: Users, color:'text-indigo-500', bg:'bg-indigo-50' },
          { label:'الاختبارات', href:'/admin/exams', icon: ClipboardList, color:'text-purple-500', bg:'bg-purple-50' },
          { label:'الاشتراكات', href:'/admin/subscriptions', icon: Award, color:'text-emerald-500', bg:'bg-emerald-50' },
          { label:'البيانات التجريبية', href:'/admin/seed', icon: Database, color:'text-amber-500', bg:'bg-amber-50' },
        ].map((s,i) => (
          <Link key={i} href={s.href} className="stat-card hover:-translate-y-1 transition-all hover:shadow-md flex flex-col items-center justify-center gap-2 py-6">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`h-6 w-6 ${s.color}`} /></div>
            <span className="text-sm font-medium text-gray-700">{s.label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  );

  // ── Teacher view ──
  if (isTeacher(user)) return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm mb-1">{roleGreet['teacher']}</p>
          <h1 className="text-2xl font-bold">{username}</h1>
          <p className="text-emerald-200 text-sm mt-1">أنشئ اختبارات رائعة وتابع نتائج طلابك</p>
          <div className="flex gap-3 mt-4">
            <Link href="/app/teacher/exams/new" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> اختبار جديد
            </Link>
            <Link href="/app/teacher/results" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> النتائج
            </Link>
          </div>
        </div>
        <BookOpen className="absolute right-6 top-1/2 -translate-y-1/2 h-24 w-24 text-white/10" />
      </div>

      {/* Teacher Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'اختباراتي', value: tStats?.total_exams ?? '—', icon: ClipboardList, color:'text-indigo-500', bg:'bg-indigo-50' },
          { label:'جلسات الطلاب', value: tStats?.total_sessions ?? '—', icon: Users, color:'text-purple-500', bg:'bg-purple-50' },
          { label:'متوسط الدرجات', value: tStats?.avg_score ? `${tStats.avg_score}%` : '—', icon: TrendingUp, color:'text-emerald-500', bg:'bg-emerald-50' },
          { label:'معدل النجاح', value: tStats?.pass_rate ? `${tStats.pass_rate}%` : '—', icon: Award, color:'text-amber-500', bg:'bg-amber-50' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'إنشاء اختبار', href:'/app/teacher/exams/new', icon: PlusCircle, color:'from-indigo-500 to-purple-500' },
          { label:'اختباراتي', href:'/app/teacher/exams', icon: ClipboardList, color:'from-blue-500 to-cyan-500' },
          { label:'النتائج', href:'/app/teacher/results', icon: BarChart3, color:'from-emerald-500 to-teal-500' },
          { label:'مساعد AI', href:'/app/ai', icon: Brain, color:'from-purple-500 to-pink-500' },
        ].map((a,i) => (
          <Link key={i} href={a.href}
            className="group exam-card p-4 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col items-center text-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
              <a.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent results */}
      {sessions.length > 0 && (
        <div className="exam-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-500" /><h3 className="font-semibold text-gray-900">آخر النتائج</h3></div>
            <Link href="/app/teacher/results" className="text-sm text-indigo-600 flex items-center gap-1">عرض الكل <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.student_name}</p>
                  <p className="text-xs text-gray-400">{s.exams?.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.score !== null && <span className="text-sm font-bold text-gray-700">{s.score}%</span>}
                  <span className={`exam-badge text-xs ${s.passed ? 'exam-badge-success' : 'exam-badge-danger'}`}>
                    {s.passed ? '✓ ناجح' : '✗ راسب'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Student view ──
  const weekData = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map(d => ({ day:d, score: Math.floor(Math.random()*30+60) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white">
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm mb-1">مرحباً بعودتك 👋</p>
          <h1 className="text-2xl font-bold">{username}</h1>
          <p className="text-indigo-200 text-sm mt-1">استمر في رحلتك التعليمية</p>
        </div>
        <Award className="absolute right-6 top-1/2 -translate-y-1/2 h-24 w-24 text-white/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'الدورات',       value:'12',   icon: BookOpen,    color:'text-blue-500',    bg:'bg-blue-50' },
          { label:'الاختبارات',   value:'47',   icon: ClipboardList,color:'text-purple-500',  bg:'bg-purple-50' },
          { label:'متوسط الدرجات',value:'86%',  icon: TrendingUp,  color:'text-emerald-500', bg:'bg-emerald-50' },
          { label:'ساعات الدراسة',value:'124',  icon: Clock,       color:'text-orange-500',  bg:'bg-orange-50' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="exam-card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">أداؤك هذا الأسبوع</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0,100]} />
              <Tooltip contentStyle={{ borderRadius:'8px', border:'none', boxShadow:'0 10px 25px rgba(0,0,0,.1)', fontSize:'12px' }} formatter={(v:number) => [`${v}%`,'الدرجة']} />
              <Bar dataKey="score" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'الدورات',   href:'/app/courses',   icon: BookOpen,    color:'from-blue-500 to-cyan-500' },
          { label:'الاختبارات',href:'/app/exams',     icon: ClipboardList,color:'from-purple-500 to-indigo-500' },
          { label:'مساعد AI', href:'/app/ai',         icon: Brain,       color:'from-emerald-500 to-teal-500' },
          { label:'التحليلات', href:'/app/analytics', icon: BarChart3,   color:'from-orange-500 to-amber-500' },
        ].map((a,i) => (
          <Link key={i} href={a.href} className="group exam-card p-4 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col items-center text-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
              <a.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
