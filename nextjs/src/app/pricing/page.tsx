"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Star, GraduationCap, Zap, Shield, X } from 'lucide-react';

const plans = [
  {
    key: 'free', name: 'مجاني', price: 0, period: 'للأبد',
    description: 'مثالي للمعلمين الذين يريدون تجربة المنصة',
    color: 'border-gray-200', badge: '', cta: 'ابدأ مجاناً',
    features: [
      '5 اختبارات نشطة', '50 جلسة طالب / شهر', 'أسئلة AI (10/شهر)',
      'رابط مشاركة عام', 'تصدير CSV', 'دعم البريد الإلكتروني',
    ],
    limits: ['لا يوجد تحليلات متقدمة', 'لا يوجد دعوات إيميل'],
  },
  {
    key: 'pro', name: 'احترافي', price: 49, period: '/شهر',
    description: 'للمعلمين والمدرّبين المحترفين',
    color: 'border-indigo-400', badge: 'الأكثر شعبية', cta: 'ابدأ التجربة',
    features: [
      'اختبارات غير محدودة', '500 جلسة طالب / شهر', 'AI غير محدود',
      'دعوات إيميل', 'تحليلات متقدمة', 'تصدير PDF + CSV',
      'دعم أولوية 24/7', 'تخصيص الشعار',
    ],
    limits: [],
  },
  {
    key: 'enterprise', name: 'مؤسسي', price: 199, period: '/شهر',
    description: 'للمؤسسات التعليمية والشركات',
    color: 'border-purple-400', badge: '', cta: 'تواصل معنا',
    features: [
      'كل مميزات الاحترافي', 'جلسات غير محدودة', 'API مخصص',
      'مدير حساب مخصص', 'SLA 99.9%', 'تدريب الفريق',
      'نشر على سيرفرك الخاص', 'تكامل SSO/LDAP',
    ],
    limits: [],
  },
];

const faq = [
  { q: 'هل يمكن تغيير الخطة لاحقاً؟', a: 'نعم، يمكنك الترقية أو التخفيض في أي وقت. يُحسب الفرق تلقائياً.' },
  { q: 'هل الطلاب يحتاجون حسابات؟', a: 'لا! الطلاب يدخلون الاختبار بالرابط مع اسمهم وإيميلهم فقط، بدون تسجيل.' },
  { q: 'هل هناك نسخة تجريبية؟', a: 'نعم، الخطة المجانية متاحة دون حد زمني. الخطط المدفوعة بها 14 يوم استرداد.' },
  { q: 'ما طرق الدفع المتاحة؟', a: 'بطاقات الائتمان (Visa/Mastercard/Amex) عبر Stripe المشفّر.' },
  { q: 'هل يمكن إلغاء الاشتراك؟', a: 'نعم، إلغاء في أي وقت بدون رسوم إضافية. تبقى المميزات حتى نهاية الفترة.' },
];

export default function PricingPage() {
  const [annual,   setAnnual]   = useState(false);
  const [loading,  setLoading]  = useState<string | null>(null);
  const [msg,      setMsg]      = useState('');
  const [openFaq,  setOpenFaq]  = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') setMsg('✓ تم الاشتراك بنجاح! مرحباً في EXAM');
    if (params.get('cancelled') === 'true') setMsg('تم إلغاء عملية الدفع');
    (async () => {
      const { createSPAClient } = await import('@/lib/supabase/client');
      const { data: { user } } = await createSPAClient().auth.getUser();
      setIsLoggedIn(!!user);
    })();
  }, []);

  const subscribe = async (plan: string) => {
    if (plan === 'free') { window.location.href = '/auth/register'; return; }
    if (plan === 'enterprise') { window.location.href = 'mailto:contact@exam.dz'; return; }
    if (!isLoggedIn) { window.location.href = '/auth/login'; return; }
    setLoading(plan);
    try {
      const res  = await fetch('/api/stripe/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (data.url)   window.location.href = data.url;
      else if (data.error) setMsg(`خطأ: ${data.error}`);
    } catch { setMsg('خطأ في الاتصال'); }
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">EXAM</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn
              ? <Link href="/app" className="exam-btn-primary text-sm py-1.5 px-4">لوحة التحكم</Link>
              : <><Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">دخول</Link>
                <Link href="/auth/register" className="exam-btn-primary text-sm py-1.5 px-4">تسجيل مجاني</Link></>}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {msg && (
          <div className={`max-w-md mx-auto mb-8 p-4 rounded-xl text-sm text-center ${msg.includes('✓') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
            {msg}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <span className="exam-badge exam-badge-primary mb-4">الأسعار</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">خطط تناسب جميع الاحتياجات</h1>
          <p className="text-gray-500 mt-4 text-lg">ابدأ مجاناً، وقم بالترقية عندما تكون جاهزاً</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>شهري</span>
            <button onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-indigo-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${annual ? 'right-0.5' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
              سنوي <span className="exam-badge exam-badge-success text-xs">وفّر 20%</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map(p => {
            const price = annual && p.price > 0 ? Math.round(p.price * 0.8) : p.price;
            return (
              <div key={p.key} className={`relative bg-white rounded-2xl border-2 ${p.color} p-6 flex flex-col ${p.badge ? 'shadow-xl' : ''}`}>
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />{p.badge}
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{p.description}</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-black text-gray-900">${price}</span>
                    <span className="text-gray-400 text-sm">{price > 0 ? p.period : ''}</span>
                  </div>
                  {annual && price > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">وفّر ${(p.price - price) * 12}/سنة</p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.features.map((f,i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                  {p.limits.map((f,i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <X className="h-4 w-4 shrink-0" />{f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => subscribe(p.key)} disabled={loading === p.key}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${p.badge
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50`}>
                  {loading === p.key
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري...</>
                    : <>{p.cta} <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-16 text-sm text-gray-500">
          {[
            [Shield, 'SSL مشفّر 256-bit'],
            [Zap,    'بدون رسوم خفية'],
            [Star,   '14 يوم استرداد'],
            [Shield, 'دعم على مدار الساعة'],
          ].map(([Icon, text], i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-indigo-400" />
              <span>{String(text)}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {faq.map((f, i) => (
              <div key={i} className="exam-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-800 text-sm">{f.q}</span>
                  <span className={`text-indigo-500 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 mt-16">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">جاهز للبدء؟</h2>
          <p className="text-indigo-200 mb-8">سجّل مجاناً الآن واختبر جميع مميزات EXAM</p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl">
            ابدأ مجاناً <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
