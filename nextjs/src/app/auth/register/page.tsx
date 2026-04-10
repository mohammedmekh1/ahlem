'use client';
import { createSPASaaSClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from "@/components/SSOButtons";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [acceptedTerms,   setAcceptedTerms]   = useState(false);
  const router = useRouter();

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['','ضعيفة','متوسطة','قوية'][strength];
  const strengthColor = ['','bg-red-400','bg-yellow-400','bg-emerald-400'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!acceptedTerms) { setError('يجب قبول شروط الاستخدام'); return; }
    if (password !== confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const supabase = await createSPASaaSClient();
      const { error } = await supabase.registerEmail(email, password);
      if (error) throw error;
      router.push('/auth/verify-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
        <p className="text-gray-500 text-sm mt-2">انضم إلى آلاف الطلاب على منصة EXAM.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="email" className="exam-input pr-10" placeholder="example@exam.dz"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type={showPass ? 'text' : 'password'} className="exam-input pr-10 pl-10" placeholder="8 أحرف على الأقل"
              value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-100'}`} />)}
              </div>
              <p className="text-xs text-gray-400">قوة كلمة المرور: <span className="font-medium">{strengthLabel}</span></p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="password" className="exam-input pr-10" placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            {confirmPassword && password === confirmPassword && (
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            )}
          </div>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-indigo-600" />
          <span className="text-sm text-gray-600">
            أوافق على{' '}
            <Link href="/legal/terms" className="text-indigo-600 hover:underline">شروط الاستخدام</Link>
            {' '}و{' '}
            <Link href="/legal/privacy" className="text-indigo-600 hover:underline">سياسة الخصوصية</Link>
          </span>
        </label>

        <button type="submit" disabled={loading || !acceptedTerms}
          className="exam-btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري إنشاء الحساب...</>
                   : <>إنشاء الحساب <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <SSOButtons onError={setError} />

      <p className="mt-6 text-center text-sm text-gray-500">
        لديك حساب بالفعل؟{' '}
        <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">سجّل دخولك</Link>
      </p>
    </div>
  );
}
