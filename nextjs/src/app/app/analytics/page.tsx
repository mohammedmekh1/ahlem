"use client";
import React from 'react';
import { BarChart3, TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const monthlyData = [
  { month: 'يناير', exams: 4, avg: 72 }, { month: 'فبراير', exams: 6, avg: 78 },
  { month: 'مارس', exams: 5, avg: 75 }, { month: 'أبريل', exams: 8, avg: 84 },
  { month: 'مايو', exams: 10, avg: 88 }, { month: 'يونيو', exams: 9, avg: 91 },
];
const subjectData = [
  { subject: 'رياضيات', score: 88 }, { subject: 'فيزياء', score: 76 },
  { subject: 'كيمياء', score: 82 }, { subject: 'تاريخ', score: 94 }, { subject: 'تقنية', score: 91 },
];
const pieData = [
  { name: 'ممتاز (90+)',   value: 35, color: '#6366f1' },
  { name: 'جيد جداً (80+)',value: 40, color: '#8b5cf6' },
  { name: 'جيد (70+)',     value: 18, color: '#a5b4fc' },
  { name: 'أقل من 70',    value: 7,  color: '#e2e8f0' },
];
const radarData = [
  { skill: 'الفهم',    score: 85 }, { skill: 'التحليل',  score: 72 },
  { skill: 'التطبيق', score: 90 }, { skill: 'التقييم',  score: 68 },
  { skill: 'الإبداع', score: 78 }, { skill: 'الحفظ',    score: 95 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التحليلات والتقارير</h1>
        <p className="text-gray-500 text-sm mt-1">تتبع أداءك وقياس تقدمك بدقة</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'متوسط الدرجات',   value: '85.4%',icon: TrendingUp, color: 'text-indigo-500',  bg: 'bg-indigo-50',  change: '+3.2%' },
          { label: 'الاختبارات الكلية',value: '42',   icon: BarChart3, color: 'text-purple-500',  bg: 'bg-purple-50',  change: '+8 هذا الشهر' },
          { label: 'الإنجازات',        value: '12',   icon: Award,     color: 'text-yellow-500', bg: 'bg-yellow-50',  change: '+2 جديدة' },
          { label: 'الأهداف المحققة', value: '68%',  icon: Target,    color: 'text-emerald-500', bg: 'bg-emerald-50', change: 'من 10 أهداف' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-emerald-600 mt-2 font-medium">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Monthly Progress */}
      <div className="exam-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">التقدم الشهري</h3>
            <p className="text-sm text-gray-400 mt-0.5">عدد الاختبارات ومتوسط الدرجات شهرياً</p>
          </div>
          <span className="exam-badge exam-badge-primary flex items-center gap-1"><Calendar className="h-3 w-3" />2024</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)', fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="exams" name="عدد الاختبارات" fill="#e0e7ff" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="avg"   name="متوسط الدرجات"  fill="#6366f1"  radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div className="lg:col-span-2 exam-card p-6">
          <h3 className="font-semibold text-gray-900 mb-6">الأداء حسب المادة</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0,100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)', fontSize: '12px' }} formatter={(v: number) => [`${v}%`, 'الدرجة']} />
                <Bar dataKey="score" fill="url(#barGrad)" radius={[0,6,6,0]}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="exam-card p-6">
          <h3 className="font-semibold text-gray-900 mb-6">توزيع الدرجات</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Radar */}
      <div className="exam-card p-6">
        <h3 className="font-semibold text-gray-900 mb-6">مهاراتك المعرفية</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
