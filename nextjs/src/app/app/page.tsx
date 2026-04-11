"use client";
import React from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import Link from 'next/link';
import {
  BookOpen, ClipboardList, Brain, BarChart3,
  TrendingUp, Clock, Award, Users,
  ChevronRight, ArrowUpRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';

const weekData = [
  { day: 'الأحد', score: 72 }, { day: 'الاثنين', score: 85 },
  { day: 'الثلاثاء', score: 68 }, { day: 'الأربعاء', score: 91 },
  { day: 'الخميس', score: 88 }, { day: 'الجمعة', score: 95 },
  { day: 'السبت', score: 79 },
];

const progressData = [
  { month: 'يناير', progress: 45 }, { month: 'فبراير', progress: 62 },
  { month: 'مارس', progress: 58 }, { month: 'أبريل', progress: 74 },
  { month: 'مايو', progress: 82 }, { month: 'يونيو', progress: 91 },
];

const recentExams = [
  { name: 'الرياضيات - الفصل 3', score: 92, total: 100, date: 'منذ يومين', status: 'ممتاز' },
  { name: 'الفيزياء - الحركة',    score: 78, total: 100, date: 'منذ 5 أيام', status: 'جيد جداً' },
  { name: 'الكيمياء العضوية',    score: 85, total: 100, date: 'منذ أسبوع',   status: 'ممتاز' },
];

const quickActions = [
  { label: 'استكشف الدورات',   href: '/app/courses',    icon: BookOpen,    color: 'from-blue-500 to-cyan-500' },
  { label: 'ابدأ اختباراً',   href: '/app/exams',      icon: ClipboardList,color: 'from-purple-500 to-indigo-500' },
  { label: 'مساعد الذكاء',    href: '/app/ai',         icon: Brain,       color: 'from-emerald-500 to-teal-500' },
  { label: 'التحليلات',       href: '/app/analytics',  icon: BarChart3,   color: 'from-orange-500 to-amber-500' },
];

export default function DashboardPage() {
  const { user, loading } = useGlobal();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  const username = user?.email?.split('@')[0] || 'مستخدم';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white">
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm mb-1">مرحباً بعودتك 👋</p>
          <h1 className="text-2xl font-bold mb-1">{username}</h1>
          <p className="text-indigo-200 text-sm">استمر في رحلتك التعليمية — لقد أنجزت 68% من أهدافك هذا الأسبوع</p>
          <div className="mt-4 w-48">
            <div className="flex justify-between text-xs text-indigo-200 mb-1">
              <span>تقدم الأسبوع</span><span>68%</span>
            </div>
            <div className="exam-progress">
              <div className="exam-progress-bar" style={{ width: '68%', background: 'rgba(255,255,255,0.5)' }} />
            </div>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Award className="h-32 w-32" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الدورات المكتملة', value: '12',  icon: BookOpen,    color: 'text-blue-500',   bg: 'bg-blue-50',   trend: '+2 هذا الشهر' },
          { label: 'الاختبارات',       value: '47',  icon: ClipboardList,color: 'text-purple-500', bg: 'bg-purple-50', trend: '+8 هذا الشهر' },
          { label: 'متوسط الدرجات',   value: '86%', icon: TrendingUp,  color: 'text-emerald-500',bg: 'bg-emerald-50',trend: '+4% تحسّن' },
          { label: 'ساعات الدراسة',   value: '124', icon: Clock,       color: 'text-orange-500', bg: 'bg-orange-50', trend: '12 ساعة هذا الأسبوع' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-emerald-600 mt-2 font-medium">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Scores */}
        <div className="exam-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">درجات الأسبوع</h3>
              <p className="text-sm text-gray-400 mt-0.5">أداؤك في الاختبارات اليومية</p>
            </div>
            <span className="exam-badge exam-badge-success">هذا الأسبوع</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)', fontSize: '12px' }}
                  formatter={(v: number) => [`${v}%`, 'الدرجة']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {weekData.map((e, i) => (
                    <Cell key={i} fill={e.score >= 90 ? '#6366f1' : e.score >= 80 ? '#8b5cf6' : '#a5b4fc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Trend */}
        <div className="exam-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">مسار التقدم</h3>
              <p className="text-sm text-gray-400 mt-0.5">تطور أدائك خلال 6 أشهر</p>
            </div>
            <span className="exam-badge exam-badge-primary">6 أشهر</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)', fontSize: '12px' }}
                  formatter={(v: number) => [`${v}%`, 'التقدم']}
                />
                <Line type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href}
              className="group exam-card p-5 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col items-center text-center gap-3"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                <a.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Exams */}
      <div className="exam-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900">آخر الاختبارات</h3>
          </div>
          <Link href="/app/exams" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            عرض الكل <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentExams.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">{e.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{e.score}/{e.total}</p>
                  <p className="text-xs text-gray-400">{Math.round(e.score/e.total*100)}%</p>
                </div>
                <span className={`exam-badge ${e.score >= 90 ? 'exam-badge-success' : 'exam-badge-primary'}`}>
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
