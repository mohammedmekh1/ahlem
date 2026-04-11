'use client';
import { createSPASaaSClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from '@/components/SSOButtons';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const client = await createSPASaaSClient();
      const { error: signInError } = await client.loginEmail(email, password);
      if (signInError) throw signInError;
      const supabase = client.getSupabaseClient();
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaError) throw mfaError;
      if (mfaData.nextLevel === 'aal2' && mfaData.nextLevel !== mfaData.currentLevel) {
        setShowMFAPrompt(true);
      } else { router.push('/app'); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (showMFAPrompt) router.push('/auth/2fa'); }, [showMFAPrompt, router]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
        <p className="text-gray-500 text-sm mt-2">أهلاً بعودتك! أدخل بياناتك للمتابعة.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <span className="text-red-400">⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="email" className="exam-input pr-10" placeholder="example@exam.dz"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
            <Link href="/auth/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700">نسيت كلمة المرور؟</Link>
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type={showPass ? 'text' : 'password'} className="exam-input pr-10 pl-10" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="exam-btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري تسجيل الدخول...</>
                   : <>تسجيل الدخول <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <SSOButtons onError={setError} />

      <p className="mt-6 text-center text-sm text-gray-500">
        ليس لديك حساب؟{' '}
        <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
          سجّل الآن مجاناً
        </Link>
      </p>
    </div>
  );
}
