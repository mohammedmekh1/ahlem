'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSPASaaSClient } from '@/lib/supabase/client';
import { ArrowRight, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

interface Props { variant?: 'nav' | 'hero'; }

export default function AuthAwareButtons({ variant = 'hero' }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const client = await createSPASaaSClient();
        const supabase = client.getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        supabase.auth.onAuthStateChange((_, session) => setIsAuthenticated(!!session?.user));
      } catch { setIsAuthenticated(false); }
    })();
  }, []);

  if (isAuthenticated === null) return (
    <div className={`flex gap-2 ${variant === 'nav' ? 'items-center' : 'justify-center'}`}>
      <div className="w-24 h-9 skeleton rounded-lg" />
      <div className="w-24 h-9 skeleton rounded-lg" />
    </div>
  );

  if (isAuthenticated) return (
    <div className={`flex gap-2 ${variant === 'nav' ? 'items-center' : 'justify-center'}`}>
      <Link href="/app"
        className={variant === 'nav'
          ? 'flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors'
          : 'exam-btn-primary'}>
        <LayoutDashboard className="h-4 w-4" />
        لوحة التحكم
        {variant === 'hero' && <ArrowRight className="h-4 w-4" />}
      </Link>
    </div>
  );

  return (
    <div className={`flex gap-2 ${variant === 'nav' ? 'items-center' : 'justify-center'}`}>
      <Link href="/auth/login"
        className={variant === 'nav'
          ? 'flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          : 'exam-btn-secondary'}>
        <LogIn className="h-4 w-4" />
        تسجيل الدخول
      </Link>
      <Link href="/auth/register"
        className={variant === 'nav'
          ? 'flex items-center gap-1 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors'
          : 'exam-btn-primary'}>
        <UserPlus className="h-4 w-4" />
        سجّل مجاناً
        {variant === 'hero' && <ArrowRight className="h-4 w-4" />}
      </Link>
    </div>
  );
}
