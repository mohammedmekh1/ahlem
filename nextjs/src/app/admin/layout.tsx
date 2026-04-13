'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { GlobalProvider, useGlobal, isAdmin } from '@/lib/context/GlobalContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useGlobal();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin(user)) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="exam-card p-10 text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-9 w-9 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">403 — وصول مرفوض</h1>
        <p className="text-gray-500 text-sm mb-6">
          لوحة الإدارة متاحة للمالك والمشرفين فقط.
          <br/>
          <span className="text-xs text-gray-400 mt-1 block">دورك الحالي: {user?.role || 'غير محدد'}</span>
        </p>
        <Link href="/app" className="exam-btn-primary justify-center">
          <ArrowLeft className="h-4 w-4" /> العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl px-4 py-2 text-xs font-semibold">
        <ShieldAlert className="h-4 w-4" />
        لوحة الإدارة — صلاحيات {user?.role === 'owner' ? 'المالك (كاملة)' : 'المشرف'}
      </div>
      {children}
    </AppLayout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider>
      <AdminGuard>{children}</AdminGuard>
    </GlobalProvider>
  );
}
