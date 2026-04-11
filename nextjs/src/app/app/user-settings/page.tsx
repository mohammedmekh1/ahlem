"use client";
import React, { useState } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASaaSClientAuthenticated as createSPASaaSClient } from '@/lib/supabase/client';
import { Key, User, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Bell, Palette, Globe } from 'lucide-react';
import { MFASetup } from '@/components/MFASetup';

export default function UserSettingsPage() {
  const { user } = useGlobal();
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [activeTab,       setActiveTab]       = useState<'profile'|'security'|'notifications'|'appearance'>('profile');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (newPassword.length < 8)          { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const supabase = await createSPASaaSClient();
      const { error } = await supabase.getSupabaseClient().auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تغيير كلمة المرور');
    } finally { setLoading(false); }
  };

  const tabs = [
    { key: 'profile',       label: 'الملف الشخصي', icon: User },
    { key: 'security',      label: 'الأمان',        icon: Shield },
    { key: 'notifications', label: 'الإشعارات',    icon: Bell },
    { key: 'appearance',    label: 'المظهر',        icon: Palette },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات الحساب</h1>
        <p className="text-gray-500 text-sm mt-1">إدارة معلوماتك الشخصية وإعدادات الأمان</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error   && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm"><CheckCircle className="h-4 w-4 shrink-0" />{success}</div>}

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="exam-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.email?.split('@')[0]}</h3>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <span className="exam-badge exam-badge-primary mt-1">
                  {user?.is_admin ? 'مدير' : 'طالب'}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { label: 'معرّف المستخدم', value: user?.id || '—', icon: User },
                { label: 'البريد الإلكتروني', value: user?.email || '—', icon: User },
                { label: 'تاريخ الانضمام', value: user?.registered_at ? new Date(user.registered_at).toLocaleDateString('ar-DZ') : '—', icon: User },
              ].map((field, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">{field.label}</span>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="exam-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Key className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">تغيير كلمة المرور</h3>
                <p className="text-xs text-gray-400">يُنصح بتغييرها بانتظام لحماية حسابك</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="exam-input pl-10"
                    placeholder="8 أحرف على الأقل"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3].map(i => {
                        const str = newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
                        return <div key={i} className={`h-1 flex-1 rounded-full ${i <= str ? ['','bg-red-400','bg-yellow-400','bg-emerald-400'][str] : 'bg-gray-100'}`} />;
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input type="password" className="exam-input pl-10"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  {confirmPassword && confirmPassword === newPassword && (
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="exam-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ...</> : 'حفظ كلمة المرور الجديدة'}
              </button>
            </form>
          </div>

          {/* MFA */}
          <MFASetup onStatusChange={() => setSuccess('تم تحديث إعدادات التحقق الثنائي بنجاح')} />
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && (
        <div className="exam-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">إعدادات الإشعارات</h3>
          {[
            { label: 'إشعارات الاختبارات الجديدة',  desc: 'عندما يتم إضافة اختبار جديد',        on: true },
            { label: 'تذكير بالمواعيد النهائية',      desc: 'قبل 24 ساعة من انتهاء وقت الاختبار', on: true },
            { label: 'نتائج الاختبارات',              desc: 'عند نشر درجات الاختبار',             on: false },
            { label: 'رسائل البريد الإلكتروني',      desc: 'ملخص أسبوعي للنشاط',                on: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button className={`relative w-11 h-6 rounded-full transition-colors ${item.on ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${item.on ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Appearance Tab ── */}
      {activeTab === 'appearance' && (
        <div className="exam-card p-6 space-y-6">
          <h3 className="font-semibold text-gray-900">تخصيص المظهر</h3>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">لون النظام</p>
            <div className="flex gap-3">
              {[
                { label: 'بنفسجي', color: 'bg-indigo-500', active: true },
                { label: 'أزرق',   color: 'bg-blue-500',   active: false },
                { label: 'أخضر',  color: 'bg-emerald-500', active: false },
                { label: 'وردي',   color: 'bg-rose-500',   active: false },
              ].map((c, i) => (
                <button key={i} className={`w-10 h-10 rounded-xl ${c.color} ${c.active ? 'ring-2 ring-offset-2 ring-indigo-500' : ''} transition-all hover:scale-110`} title={c.label} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">اللغة</p>
            <select className="exam-input w-auto">
              <option>العربية</option>
              <option>English</option>
              <option>Français</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
