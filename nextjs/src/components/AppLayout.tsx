"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, User, Menu, X, ChevronDown, LogOut,
  Files, Brain, Shield, GraduationCap,
  BookOpen, ClipboardList, BarChart3, Bell,
  PlusCircle, Users, Settings, Crown, ListChecks,
  TrendingUp, Database
} from 'lucide-react';
import { useGlobal, isAdmin, isTeacher } from '@/lib/context/GlobalContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { createSPASaaSClient } from '@/lib/supabase/client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useGlobal();

  const handleLogout = async () => {
    try {
      const client = await createSPASaaSClient();
      await client.logout();
    } catch (e) { console.error(e); }
  };

  const getInitials = (email: string) =>
    email.split('@')[0].slice(0, 2).toUpperCase();

  const roleBadge: Record<string,{label:string;color:string}> = {
    owner:   { label:'مالك',  color:'bg-purple-100 text-purple-700' },
    admin:   { label:'مشرف',  color:'bg-amber-100  text-amber-700'  },
    teacher: { label:'معلم',  color:'bg-emerald-100 text-emerald-700' },
    student: { label:'طالب',  color:'bg-blue-100   text-blue-700'   },
  };

  const studentNav = [
    { name:'لوحة التحكم',   href:'/app',               icon:Home },
    { name:'دوراتي',        href:'/app/courses',        icon:BookOpen },
    { name:'اختباراتي',    href:'/app/exams',          icon:ClipboardList },
    { name:'مساعد الذكاء', href:'/app/ai',             icon:Brain },
    { name:'ملفاتي',       href:'/app/storage',        icon:Files },
    { name:'تحليلاتي',     href:'/app/analytics',      icon:BarChart3 },
    { name:'الإعدادات',    href:'/app/user-settings',  icon:User },
  ];

  const teacherNav = [
    { name:'لوحة التحكم',     href:'/app',                      icon:Home },
    { name:'اختباراتي',      href:'/app/teacher/exams',        icon:ClipboardList },
    { name:'إنشاء اختبار',   href:'/app/teacher/exams/new',    icon:PlusCircle },
    { name:'نتائج الطلاب',   href:'/app/teacher/results',      icon:ListChecks },
    { name:'مساعد الذكاء',   href:'/app/ai',                   icon:Brain },
    { name:'الملفات',         href:'/app/storage',              icon:Files },
    { name:'التحليلات',      href:'/app/analytics',            icon:TrendingUp },
    { name:'الإعدادات',      href:'/app/user-settings',        icon:User },
  ];

  const adminNav = [
    { name:'لوحة التحكم',       href:'/app',                    icon:Home },
    { name:'نظرة عامة',         href:'/admin',                  icon:Shield },
    { name:'المستخدمون',        href:'/admin',                  icon:Users },
    { name:'جميع الاختبارات',  href:'/admin/exams',            icon:ClipboardList },
    { name:'التقارير',           href:'/admin/reports',          icon:BarChart3 },
    { name:'الاشتراكات',        href:'/admin/subscriptions',    icon:Crown },
    { name:'البيانات التجريبية',href:'/admin/seed',             icon:Database },
    { name:'الإعدادات',         href:'/admin/settings',         icon:Settings },
    { name:'حسابي',             href:'/app/user-settings',      icon:User },
  ];

  const navigation = isAdmin(user) ? adminNav : isTeacher(user) ? teacherNav : studentNav;
  const rb = roleBadge[user?.role ?? 'student'];

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href) && href !== '/app' && href !== '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`exam-sidebar fixed inset-y-0 left-0 w-64 z-30 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link href="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EXAM</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="mx-3 mt-4 mb-1 p-3 rounded-xl bg-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {getInitials(user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">
                {user.full_name || user.email.split('@')[0]}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rb.color}`}>
                {rb.label}
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {isAdmin(user) && (
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-2 mb-2 mt-1">الإدارة</p>
          )}
          {navigation.map((item) => (
            <Link key={`${item.href}-${item.name}`} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`exam-nav-item ${isActive(item.href) ? 'active' : ''}`}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="exam-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="h-4 w-4 shrink-0" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <LanguageSwitcher />

            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                  {user ? getInitials(user.email) : '??'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20">
                    <div className="p-3 border-b border-gray-50">
                      <p className="text-xs text-gray-400">مسجّل دخول كـ</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${rb?.color}`}>
                        {rb?.label}
                      </span>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { setDropdownOpen(false); router.push('/app/user-settings'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" /> إعدادات الحساب
                      </button>
                      {isAdmin(user) && (
                        <button onClick={() => { setDropdownOpen(false); router.push('/admin'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg">
                          <Shield className="h-4 w-4 text-purple-400" /> لوحة الإدارة
                        </button>
                      )}
                      <button onClick={() => { handleLogout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                        <LogOut className="h-4 w-4 text-red-400" /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
