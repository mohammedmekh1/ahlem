'use client';
import { useState, useEffect } from 'react';
import { createSPASaaSClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = await createSPASaaSClient();
      const { data: { user }, error } = await supabase.getSupabaseClient().auth.getUser();
      if (error || !user) setError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية.');
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (newPassword !== confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (newPassword.length < 8)          { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const supabase = await createSPASaaSClient();
      const { error } = await supabase.getSupabaseClient().auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/app'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إعادة تعيين كلمة المرور');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-9 w-9 text-emerald-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">تم إعادة تعيين كلمة المرور!</h2>
      <p className="text-gray-500 text-sm">سيتم تحويلك للوحة التحكم خلال ثوانٍ...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
          <Key className="h-6 w-6 text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">إنشاء كلمة مرور جديدة</h1>
        <p className="text-gray-500 text-sm mt-2">يجب أن تكون 8 أحرف على الأقل.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">⚠ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} className="exam-input pl-10" placeholder="••••••••"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
          <div className="relative">
            <input type="password" className="exam-input pl-10" placeholder="••••••••"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            {confirmPassword && confirmPassword === newPassword && (
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            )}
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="exam-btn-primary w-full justify-center py-3 disabled:opacity-50">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ...</>
            : <>حفظ كلمة المرور <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
}
