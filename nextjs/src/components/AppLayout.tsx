"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, User, Menu, X, ChevronDown, LogOut,
  Key, Files, Brain, Shield, GraduationCap,
  BookOpen, ClipboardList, BarChart3, Bell
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { LanguageSwitcher } from './LanguageSwitcher';
import { createSPASaaSClient } from "@/lib/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useGlobal();

  const handleLogout = async () => {
    try {
      const client = await createSPASaaSClient();
      await client.logout();
      router.push('/');
    } catch (err) { console.error(err); }
  };

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  const navigation = [
    { name: 'لوحة التحكم',   href: '/app',               icon: Home },
    { name: 'الدورات',        href: '/app/courses',        icon: BookOpen },
    { name: 'الاختبارات',    href: '/app/exams',          icon: ClipboardList },
    { name: 'مساعد الذكاء',  href: '/app/ai',             icon: Brain },
    { name: 'الملفات',        href: '/app/storage',        icon: Files },
    { name: 'التحليلات',     href: '/app/analytics',      icon: BarChart3 },
    { name: 'الإعدادات',     href: '/app/user-settings',  icon: User },
    { name: 'لوحة الإدارة',  href: '/admin',              icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`exam-sidebar fixed inset-y-0 left-0 w-64 z-30 flex flex-col transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EXAM</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User pill */}
        {user && (
          <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {getInitials(user.email)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.email.split('@')[0]}</p>
              <p className="text-white/50 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-2 mb-2">القائمة الرئيسية</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`exam-nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="exam-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-base font-semibold text-gray-800 hidden lg:block">
              {navigation.find(n => pathname === n.href || (n.href !== '/app' && pathname.startsWith(n.href)))?.name || 'لوحة التحكم'}
            </h1>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <LanguageSwitcher />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                  {user ? getInitials(user.email) : '??'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20">
                    <div className="p-3 border-b border-gray-50">
                      <p className="text-xs text-gray-400">مسجّل دخول بـ</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { setUserDropdownOpen(false); router.push('/app/user-settings'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Key className="h-4 w-4 text-gray-400" /> الإعدادات
                      </button>
                      <button
                        onClick={() => { handleLogout(); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="h-4 w-4 text-red-400" /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
