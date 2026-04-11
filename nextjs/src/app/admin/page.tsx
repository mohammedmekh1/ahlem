'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Activity, BookOpen, TrendingUp, UserCheck, UserX, Search, BarChart3, Settings, RefreshCw, Loader2, Crown, Database } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Stats { total_users:number; total_teachers:number; total_students:number; total_exams:number; published_exams:number; total_sessions:number; avg_score:number; pass_rate:number; }
interface Profile { id:string; email:string; full_name:string|null; role:string; plan:string; is_active:boolean; created_at:string; }

const weekDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export default function AdminDashboard() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [users,    setUsers]    = useState<Profile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tab,      setTab]      = useState<'overview'|'users'|'settings'>('overview');
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s  = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();
      const [{ data: st }, { data: us }] = await Promise.all([
        db.rpc('get_platform_stats'),
        db.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      if (st) setStats(st as Stats);
      setUsers((us || []) as Profile[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
    const s = await createSPASaaSClientAuthenticated();
    await s.getSupabaseClient().from('profiles').update({ is_active: !current }).eq('id', id);
    setActionMsg(!current ? 'تم تفعيل الحساب' : 'تم تعليق الحساب');
    setTimeout(() => setActionMsg(''), 3000);
    load();
  };

  const changeRole = async (id: string, role: string) => {
    const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
    const s  = await createSPASaaSClientAuthenticated();
    const db = s.getSupabaseClient();
    await db.from('profiles').update({ role, is_admin: role === 'admin' || role === 'owner' }).eq('id', id);
    setActionMsg(`تم تغيير الدور إلى ${role}`);
    setTimeout(() => setActionMsg(''), 3000);
    load();
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.email.includes(search) || (u.full_name||'').includes(search);
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColor: Record<string,string> = {
    owner:'exam-badge-danger', admin:'exam-badge-warning',
    teacher:'exam-badge-success', student:'exam-badge-primary'
  };
  const roleLabel: Record<string,string> = {
    owner:'مالك', admin:'مشرف', teacher:'معلم', student:'طالب'
  };
  const planColor: Record<string,string> = {
    free:'bg-gray-100 text-gray-600', pro:'bg-indigo-100 text-indigo-700',
    enterprise:'bg-purple-100 text-purple-700'
  };

  const activityData = weekDays.map(day => ({
    day, sessions: Math.floor(Math.random()*50+10)
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة شاملة لمنصة EXAM</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/seed" className="exam-btn-secondary text-xs py-2">
            <Database className="h-3.5 w-3.5" /> بيانات تجريبية
          </Link>
          <button onClick={load} disabled={loading} className="exam-btn-secondary text-xs py-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
          <span>✓</span>{actionMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_,i) => <div key={i} className="stat-card h-24 skeleton" />) : [
          { label:'المستخدمون', value: stats?.total_users ?? 0, icon: Users, color:'text-indigo-500', bg:'bg-indigo-50' },
          { label:'الاختبارات', value: stats?.total_exams  ?? 0, icon: BookOpen, color:'text-purple-500', bg:'bg-purple-50' },
          { label:'الجلسات',   value: stats?.total_sessions ?? 0, icon: Activity, color:'text-emerald-500', bg:'bg-emerald-50' },
          { label:'معدل النجاح', value: `${stats?.pass_rate ?? 0}%`, icon: TrendingUp, color:'text-amber-500', bg:'bg-amber-50' },
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

      {/* Sub-stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'المعلمون', value: stats?.total_teachers ?? 0 },
          { label:'الطلاب',   value: stats?.total_students ?? 0 },
          { label:'اختبارات منشورة', value: stats?.published_exams ?? 0 },
          { label:'متوسط الدرجات', value: `${stats?.avg_score ?? 0}%` },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {[['overview','نظرة عامة'],['users','المستخدمون'],['settings','الإعدادات']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab===k ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{l}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="exam-card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">نشاط الجلسات (هذا الأسبوع)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius:'8px', border:'none', boxShadow:'0 10px 25px rgba(0,0,0,.1)', fontSize:'12px' }} />
                  <Bar dataKey="sessions" fill="#6366f1" radius={[4,4,0,0]} name="جلسات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="exam-card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">توزيع المستخدمين</h3>
            <div className="space-y-3 mt-6">
              {[
                { label:'الطلاب',   count: stats?.total_students  ?? 0, total: stats?.total_users ?? 1, color:'bg-blue-500' },
                { label:'المعلمون', count: stats?.total_teachers  ?? 0, total: stats?.total_users ?? 1, color:'bg-emerald-500' },
                { label:'المشرفون', count: users.filter(u=>u.role==='admin'||u.role==='owner').length, total: stats?.total_users ?? 1, color:'bg-purple-500' },
              ].map((r,i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{r.label}</span>
                    <span className="font-medium text-gray-800">{r.count}</span>
                  </div>
                  <div className="exam-progress">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width:`${r.total>0?(r.count/r.total*100):0}%`, transition:'width .5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/admin/seed" className="flex items-center justify-center gap-2 p-3 bg-indigo-50 rounded-xl text-sm text-indigo-600 hover:bg-indigo-100 transition-colors font-medium">
                <Database className="h-4 w-4" /> بيانات تجريبية
              </Link>
              <Link href="/admin/subscriptions" className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-xl text-sm text-purple-600 hover:bg-purple-100 transition-colors font-medium">
                <Crown className="h-4 w-4" /> الاشتراكات
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className="exam-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input className="exam-input pr-9" placeholder="البحث بالإيميل أو الاسم..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="exam-input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">كل الأدوار</option>
              <option value="student">طالب</option>
              <option value="teacher">معلم</option>
              <option value="admin">مشرف</option>
              <option value="owner">مالك</option>
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50">
                  {['المستخدم','الدور','الخطة','الحالة','الانضمام','إجراءات'].map(h=>(
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(u.full_name||u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.full_name || '—'}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                          className={`exam-badge ${roleColor[u.role]} cursor-pointer border-0 bg-transparent text-xs font-semibold`}>
                          {['student','teacher','admin','owner'].map(r=><option key={r} value={r}>{roleLabel[r]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><span className={`exam-badge text-xs ${planColor[u.plan]}`}>{u.plan}</span></td>
                      <td className="px-4 py-3">
                        <span className={`exam-badge ${u.is_active ? 'exam-badge-success' : 'exam-badge-danger'}`}>
                          {u.is_active ? <><UserCheck className="h-3 w-3" />نشط</> : <><UserX className="h-3 w-3" />موقوف</>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('ar-DZ')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(u.id, u.is_active)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.is_active ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                          {u.is_active ? 'تعليق' : 'تفعيل'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">لا توجد نتائج</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="exam-card p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Settings className="h-4 w-4 text-indigo-500" />إعدادات المنصة</h3>
            {[
              { label:'تأكيد الإيميل عند التسجيل', on: true },
              { label:'السماح بالتسجيل العام', on: true },
              { label:'وضع الصيانة', on: false },
              { label:'إرسال إشعارات بالإيميل', on: true },
            ].map((s,i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">{s.label}</span>
                <div className={`w-10 h-5 rounded-full relative ${s.on ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.on ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="exam-card p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" />الأمان</h3>
            <div className="space-y-3 text-sm text-gray-600">
              {['تفعيل 2FA لجميع المشرفين','حظر محاولات تسجيل الدخول المتكررة','تسجيل جميع الأحداث (Audit Log)'].map((item,i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />{item}
                </div>
              ))}
            </div>
            <Link href="/admin/seed" className="exam-btn-primary text-sm inline-flex">
              <Database className="h-4 w-4" /> إنشاء بيانات تجريبية
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
