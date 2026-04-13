"use client";
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, Award, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Record<string,number>>({});
  useEffect(() => {
    (async () => {
      try {
        const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
        const s = await createSPASaaSClientAuthenticated();
        const { data } = await s.getSupabaseClient().rpc('get_platform_stats');
        if (data) setStats(data as Record<string,number>);
      } catch(e){ console.error(e); }
    })();
  }, []);

  const monthlyData = [
    {m:'يناير',users:12,exams:4,sessions:45},{m:'فبراير',users:28,exams:8,sessions:120},
    {m:'مارس',users:35,exams:12,sessions:180},{m:'أبريل',users:52,exams:18,sessions:290},
    {m:'مايو',users:71,exams:24,sessions:410},{m:'يونيو',users:89,exams:31,sessions:560},
  ];
  const pieData = [
    {name:'ناجح',value:stats.pass_rate||68,color:'#10b981'},
    {name:'راسب',value:100-(stats.pass_rate||68),color:'#ef4444'},
  ];

  const exportReport = () => {
    const csv = ['المؤشر,القيمة',
      `إجمالي المستخدمين,${stats.total_users||0}`,
      `المعلمون,${stats.total_teachers||0}`,
      `الطلاب,${stats.total_students||0}`,
      `الاختبارات,${stats.total_exams||0}`,
      `الجلسات,${stats.total_sessions||0}`,
      `متوسط الدرجات,${stats.avg_score||0}%`,
      `معدل النجاح,${stats.pass_rate||0}%`,
    ].join('\n');
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
    a.download='exam_report.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">التقارير والإحصاءات</h1><p className="text-gray-500 text-sm mt-1">تقارير شاملة عن أداء المنصة</p></div>
        <button onClick={exportReport} className="exam-btn-secondary"><Download className="h-4 w-4"/>تصدير CSV</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {label:'إجمالي المستخدمين',value:stats.total_users||0,icon:Users,color:'text-indigo-500',bg:'bg-indigo-50'},
          {label:'الاختبارات',value:stats.total_exams||0,icon:BarChart3,color:'text-purple-500',bg:'bg-purple-50'},
          {label:'الجلسات',value:stats.total_sessions||0,icon:Calendar,color:'text-emerald-500',bg:'bg-emerald-50'},
          {label:'معدل النجاح',value:`${stats.pass_rate||0}%`,icon:Award,color:'text-amber-500',bg:'bg-amber-50'},
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`h-5 w-5 ${s.color}`}/></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="exam-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">نمو المنصة (6 أشهر)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 10px 25px rgba(0,0,0,.1)',fontSize:'12px'}}/>
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={{r:3}} name="مستخدمون"/>
                <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={{r:3}} name="جلسات"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="exam-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">نسبة النجاح والرسوب</h3>
          <div className="h-52 flex items-center justify-center">
            <PieChart width={200} height={200}>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={(v:number)=>[`${v}%`,'']}/>
            </PieChart>
            <div className="mr-4 space-y-2">
              {pieData.map((d,i)=>(
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{background:d.color}}/>
                  <span className="text-gray-600">{d.name}</span>
                  <span className="font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="exam-card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">الاختبارات والجلسات الشهرية</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 10px 25px rgba(0,0,0,.1)',fontSize:'12px'}}/>
              <Bar dataKey="exams" fill="#6366f1" radius={[4,4,0,0]} name="اختبارات"/>
              <Bar dataKey="sessions" fill="#a5b4fc" radius={[4,4,0,0]} name="جلسات"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
