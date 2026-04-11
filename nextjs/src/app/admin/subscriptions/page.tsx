"use client";
import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle, XCircle, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Sub { id:string; user_id:string; plan:string; status:string; current_period_end:string|null; profiles: { email:string; full_name:string|null; }; }

const plans = [
  { key:'free',       name:'مجاني',    price:'$0',   color:'bg-gray-100 text-gray-700',    border:'border-gray-200',  features:['5 اختبارات','50 جلسة/شهر','AI محدود'] },
  { key:'pro',        name:'احترافي',  price:'$49',  color:'bg-indigo-100 text-indigo-700', border:'border-indigo-300', features:['اختبارات غير محدودة','500 جلسة/شهر','AI كامل','تصدير CSV','دعم أولوية'] },
  { key:'enterprise', name:'مؤسسي',   price:'$199', color:'bg-purple-100 text-purple-700', border:'border-purple-300', features:['كل مميزات Pro','جلسات غير محدودة','API مخصص','مدير حساب','SLA 99.9%'] },
];

export default function SubscriptionsPage() {
  const [subs, setSubs]     = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
        const s = await createSPASaaSClientAuthenticated();
        const { data } = await s.getSupabaseClient().from('subscriptions').select('*, profiles(email, full_name)').order('created_at', { ascending: false });
        setSubs((data || []) as Sub[]);
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const stats = {
    pro:        subs.filter(s => s.plan === 'pro' && s.status === 'active').length,
    enterprise: subs.filter(s => s.plan === 'enterprise' && s.status === 'active').length,
    revenue:    subs.filter(s=>s.status==='active').reduce((a,s)=> a + (s.plan==='pro'?49:s.plan==='enterprise'?199:0), 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">الاشتراكات</h1><p className="text-gray-500 text-sm mt-1">إدارة خطط الاشتراك والدفع</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'اشتراكات Pro',        value: stats.pro,        icon: Crown,     color:'text-indigo-500', bg:'bg-indigo-50' },
          { label:'اشتراكات Enterprise', value: stats.enterprise, icon: Users,     color:'text-purple-500', bg:'bg-purple-50' },
          { label:'الإيرادات الشهرية',   value: `$${stats.revenue}`, icon: DollarSign, color:'text-emerald-500', bg:'bg-emerald-50' },
        ].map((s,i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div><div className="text-2xl font-bold text-gray-900">{s.value}</div><div className="text-xs text-gray-400">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-5">
        {plans.map(p => (
          <div key={p.key} className={`exam-card p-5 border-2 ${p.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`exam-badge text-xs font-bold px-3 py-1 rounded-full ${p.color}`}>{p.name}</span>
              <span className="text-xl font-black text-gray-900">{p.price}<span className="text-xs font-normal text-gray-400">/شهر</span></span>
            </div>
            <ul className="space-y-1.5 mb-4">
              {p.features.map((f,i) => <li key={i} className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{f}</li>)}
            </ul>
            <div className="text-xs text-gray-400">{subs.filter(s=>s.plan===p.key&&s.status==='active').length} مشترك نشط</div>
          </div>
        ))}
      </div>

      {/* Stripe notice */}
      <div className="exam-card p-5 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 text-sm">ربط Stripe للدفع الحقيقي</h3>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              لتفعيل الدفع الحقيقي، أضف المتغيرات التالية إلى ملف .env.local:
            </p>
            <pre className="mt-2 bg-amber-100 p-2 rounded text-xs text-amber-800 overflow-x-auto">{`STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...`}</pre>
          </div>
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="exam-card overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800">سجل الاشتراكات</h3></div>
        {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          : subs.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Crown className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">لا توجد اشتراكات بعد</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50">{['المستخدم','الخطة','الحالة','انتهاء الفترة'].map(h=><th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div><p className="text-sm font-medium">{s.profiles?.full_name||'—'}</p><p className="text-xs text-gray-400">{s.profiles?.email}</p></div></td>
                    <td className="px-4 py-3"><span className={`exam-badge text-xs ${s.plan==='pro'?'exam-badge-primary':s.plan==='enterprise'?'exam-badge-danger':'bg-gray-100 text-gray-600'}`}>{s.plan}</span></td>
                    <td className="px-4 py-3"><span className={`exam-badge text-xs ${s.status==='active'?'exam-badge-success':'exam-badge-danger'}`}>{s.status==='active'?'نشط':'ملغي'}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" />{s.current_period_end?new Date(s.current_period_end).toLocaleDateString('ar-DZ'):'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
