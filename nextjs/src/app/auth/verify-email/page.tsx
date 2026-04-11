'use client';
import { useState } from 'react';
import { createSPASaaSClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const resend = async () => {
    if (!email) { setError('أدخل بريدك الإلكتروني'); return; }
    setLoading(true); setError('');
    try {
      const supabase = await createSPASaaSClient();
      const { error } = await supabase.resendVerificationEmail(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally { setLoading(false); }
  };

  return (
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <Mail className="h-9 w-9 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        أرسلنا رابط التفعيل إلى بريدك الإلكتروني. تحقق من صندوق الوارد واضغط على الرابط.
      </p>

      <div className="exam-card p-5 mb-6 text-right">
        <p className="text-sm text-gray-600 mb-3">لم تستلم البريد؟ أدخل بريدك لإعادة الإرسال:</p>

        {error   && <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm">⚠ {error}</div>}
        {success && <div className="mb-3 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" />تم إرسال البريد بنجاح</div>}

        <input type="email" className="exam-input mb-3" placeholder="بريدك الإلكتروني"
          value={email} onChange={e => setEmail(e.target.value)} />
        <button onClick={resend} disabled={loading}
          className="exam-btn-secondary w-full justify-center disabled:opacity-50">
          {loading ? <><span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />جاري الإرسال...</>
                   : <><RefreshCw className="h-4 w-4" />إعادة إرسال رابط التفعيل</>}
        </button>
      </div>

      <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" /> العودة لتسجيل الدخول
      </Link>
    </div>
  );
}
