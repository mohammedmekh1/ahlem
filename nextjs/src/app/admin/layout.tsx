'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real app, we would check if the user is_admin here
  return (
    <AppLayout>
      <div className="border-b bg-red-50 p-2 text-center text-xs font-bold text-red-600">
        ADMIN PANEL - HIGH PRIVILEGES
      </div>
      {children}
    </AppLayout>
  );
}
