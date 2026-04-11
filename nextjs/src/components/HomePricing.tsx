'use client';
import Link from 'next/link';
import { CheckCircle, Star } from 'lucide-react';

const plans = [
  { name: 'مجاني',    price: 0,   features: ['5 دورات تعليمية','50 طالب','اختبارات أساسية','تقارير بسيطة'],           popular: false },
  { name: 'احترافي', price: 49,  features: ['دورات غير محدودة','500 طالب','ذكاء اصطناعي','تحليلات متقدمة','دعم أولوية'], popular: true  },
  { name: 'مؤسسي',   price: 199, features: ['كل شيء مشمول','طلاب غير محدودين','API مخصص','مدير حساب مخصص'],          popular: false },
];

export default function HomePricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="exam-badge exam-badge-warning mb-4">الأسعار</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4">اختر الخطة المناسبة</h2>
          <p className="mt-4 text-gray-500 text-lg">ابدأ مجاناً وقم بالترقية عند الحاجة</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div key={i} className={`relative rounded-2xl p-6 border-2 transition-all ${p.popular ? 'border-indigo-500 shadow-xl scale-105 bg-white' : 'border-gray-200 bg-white'}`}>
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" />الأكثر شعبية
                  </span>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">${p.price}</span>
                <span className="text-gray-400 text-sm">/شهر</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register"
                className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${p.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {p.price === 0 ? 'ابدأ مجاناً' : 'ابدأ التجربة'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
