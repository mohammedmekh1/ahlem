'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSPASaaSClient } from '@/lib/supabase/client';
import { MFAVerification } from '@/components/MFAVerification';
import { Shield, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const supabase = await createSPASaaSClient();
        const client   = supabase.getSupabaseClient();
        const { data: { user }, error: sessionError } = await client.auth.getUser();
        if (sessionError || !user) { router.push('/auth/login'); return; }
        const { data: aal, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalError) throw aalError;
        if (aal.currentLevel === 'aal2' || aal.nextLevel === 'aal1') { router.push('/app'); return; }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">EXAM</span>
          </Link>
        </div>

        <div className="exam-card p-8">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">جاري التحقق...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-600 text-sm">{error}</p>
              <Link href="/auth/login" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">التحقق الثنائي</h2>
                <p className="text-gray-500 text-sm mt-1">أدخل رمز التحقق من تطبيق المصادقة</p>
              </div>
              <MFAVerification onVerified={() => router.push('/app')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
