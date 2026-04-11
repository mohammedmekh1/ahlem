'use client';
import { useState } from 'react';
import { createSPASaaSClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const supabase = await createSPASaaSClient();
      const { error } = await supabase.getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-9 w-9 text-emerald-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h2>
      <p className="text-gray-500 text-sm mb-6">أرسلنا رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong></p>
      <Link href="/auth/login" className="exam-btn-secondary justify-center w-full">
        <ArrowLeft className="h-4 w-4" /> العودة لتسجيل الدخول
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h1>
        <p className="text-gray-500 text-sm mt-2">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">⚠ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="email" className="exam-input pr-10" placeholder="example@exam.dz"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="exam-btn-primary w-full justify-center py-3 disabled:opacity-50">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإرسال...</>
            : <>إرسال رابط الاستعادة <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        تذكرت كلمة مرورك؟{' '}
        <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">سجّل دخولك</Link>
      </p>
    </div>
  );
}
