'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { GlobalProvider, useGlobal } from '@/lib/context/GlobalContext';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useGlobal();

  if (loading) return <div>Loading...</div>;

  if (!user?.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">403</h1>
          <p className="mt-2 text-xl font-medium">Access Denied</p>
          <p className="mt-4 text-gray-500">You do not have permission to access the admin panel.</p>
          <a href="/app" className="mt-6 inline-block text-primary-600 hover:underline">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="border-b bg-red-50 p-2 text-center text-xs font-bold text-red-600">
        ADMIN PANEL - HIGH PRIVILEGES
      </div>
      {children}
    </AppLayout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider>
      <AdminGuard>
        {children}
      </AdminGuard>
    </GlobalProvider>
  );
}
