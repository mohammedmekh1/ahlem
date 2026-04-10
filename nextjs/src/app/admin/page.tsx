'use client';
import React, { useState } from 'react';
import { Users, Shield, Activity, BookOpen, TrendingUp, UserCheck, UserX, Search, MoreVertical, BarChart3, Settings, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockUsers = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@exam.dz', role: 'طالب',    status: 'نشط',   courses: 5, score: 88, joined: '2024-01-15' },
  { id: 2, name: 'فاطمة علي', email: 'fatima@exam.dz', role: 'معلم',    status: 'نشط',   courses: 12, score: 95, joined: '2024-02-10' },
  { id: 3, name: 'يوسف بن حمد',email: 'youssef@exam.dz',role: 'طالب',  status: 'موقوف', courses: 2,  score: 60, joined: '2024-03-05' },
  { id: 4, name: 'مريم حسين', email: 'mariam@exam.dz', role: 'طالب',    status: 'نشط',   courses: 8,  score: 91, joined: '2024-01-28' },
  { id: 5, name: 'خالد الزهراني',email: 'khaled@exam.dz',role: 'مدير',  status: 'نشط',   courses: 0,  score: 100, joined: '2023-12-01' },
];

const activityData = [
  { day: 'الأحد', users: 145 }, { day: 'الاثنين', users: 230 },
  { day: 'الثلاثاء', users: 189 }, { day: 'الأربعاء', users: 312 },
  { day: 'الخميس', users: 278 }, { day: 'الجمعة', users: 195 },
  { day: 'السبت', users: 160 },
];

const growthData = [
  { month: 'يناير', users: 120 }, { month: 'فبراير', users: 280 },
  { month: 'مارس', users: 450 }, { month: 'أبريل', users: 620 },
  { month: 'مايو', users: 890 }, { month: 'يونيو', users: 1240 },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users'|'courses'|'settings'>('users');

  const filtered = mockUsers.filter(u =>
    u.name.includes(search) || u.email.includes(search)
  );

  const stats = [
    { label: 'إجمالي المستخدمين', value: '1,247', icon: Users,     color: 'text-indigo-500', bg: 'bg-indigo-50',  change: '+12%' },
    { label: 'المستخدمون النشطون',value: '892',   icon: UserCheck, color: 'text-emerald-500',bg: 'bg-emerald-50', change: '+8%' },
    { label: 'الدورات النشطة',    value: '48',    icon: BookOpen,  color: 'text-blue-500',   bg: 'bg-blue-50',    change: '+5' },
    { label: 'الاختبارات اليوم',  value: '234',   icon: Activity,  color: 'text-purple-500', bg: 'bg-purple-50',  change: 'هذا اليوم' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة إدارة EXAM</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة المستخدمين والمحتوى والإعدادات</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="exam-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">نشاط المستخدمين (هذا الأسبوع)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)', fontSize: '12px' }} />
                <Bar dataKey="users" name="مستخدمون نشطون" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="exam-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">نمو المستخدمين</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="exam-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-4">
          {[['users','المستخدمون'],['courses','الدورات'],['settings','الإعدادات']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <div>
            <div className="p-4 border-b border-gray-50">
              <div className="relative max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input className="exam-input pr-9" placeholder="ابحث عن مستخدم..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['المستخدم','الدور','الحالة','الدورات','متوسط الدرجات','تاريخ الانضمام','إجراءات'].map(h => (
                      <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`exam-badge ${u.role === 'مدير' ? 'exam-badge-danger' : u.role === 'معلم' ? 'exam-badge-warning' : 'exam-badge-primary'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`exam-badge ${u.status === 'نشط' ? 'exam-badge-success' : 'exam-badge-danger'}`}>
                          {u.status === 'نشط' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.courses}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="exam-progress w-16" style={{ height: '4px' }}>
                            <div className="exam-progress-bar" style={{ width: `${u.score}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{u.score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{u.joined}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="p-8 text-center text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">إدارة الدورات</p>
            <p className="text-sm mt-1">يمكنك هنا إضافة وتعديل وحذف الدورات</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 text-center text-gray-400">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">إعدادات المنصة</p>
            <p className="text-sm mt-1">تخصيص إعدادات EXAM العامة</p>
          </div>
        )}
      </div>
    </div>
  );
}
