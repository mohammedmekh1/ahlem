'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Users, Database, Brain, BookOpen } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME || "منصة أحلام";

  const features = [
    {
      icon: Brain,
      title: 'الذكاء الاصطناعي في التعليم',
      description: 'توليد تلقائي للاختبارات وتصحيح ذكي للمقالات باستخدام تقنيات Gemini.',
      color: 'text-indigo-600'
    },
    {
      icon: Shield,
      title: 'بيئة آمنة ومتكاملة',
      description: 'حماية كاملة لبيانات الطلاب وخصوصية الاختبارات مع نظام صلاحيات متطور.',
      color: 'text-blue-600'
    },
    {
      icon: BookOpen,
      title: 'إدارة المحتوى التعليمي',
      description: 'تنظيم المواد الدراسية وبنوك الأسئلة بسهولة وفعالية تامة.',
      color: 'text-sky-600'
    }
  ];

  return (
      <div className="min-h-screen font-sans">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  {productName}
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                <Link href="#mission" className="text-gray-600 hover:text-gray-900 mx-4">
                  رسالتنا
                </Link>
                <Link href="#features" className="text-gray-600 hover:text-gray-900 mx-4">
                  المميزات
                </Link>
                <Link href="/legal/help" className="text-gray-600 hover:text-gray-900 mx-4">
                  المساعدة
                </Link>
                <AuthAwareButtons variant="nav" />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>

        <section className="relative pt-32 pb-24 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
                مستقبل التعليم الذكي مع
                <span className="block text-primary-600 mt-2">المهندسة أحلام</span>
              </h1>
              <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                نحن هنا لنحول عملية التقييم التعليمي إلى تجربة رقمية ذكية، سهلة، وآمنة. أدوات متطورة مصممة خصيصاً لخدمة المعلم والطالب.
              </p>
              <div className="mt-12 flex gap-4 justify-center">
                <AuthAwareButtons />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-24 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">رسالة المنصة</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  تهدف منصة أحلام إلى تمكين المؤسسات التعليمية والأساتذة من إدارة الاختبارات بذكاء واحترافية. نحن نؤمن بأن التكنولوجيا يجب أن تكون في خدمة المعلم لتقليل الأعباء الإدارية والتركيز على جودة التعليم.
                </p>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-primary-100">
                   <Users className="h-8 w-8 text-primary-600" />
                   <div>
                     <h4 className="font-bold text-gray-900">المهندسة أحلام</h4>
                     <p className="text-sm text-gray-500">مؤسسة المنصة ورؤيتها التقنية</p>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">+1000</div>
                  <div className="text-sm text-gray-500">طالب مستفيد</div>
                </div>
                <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">99%</div>
                  <div className="text-sm text-gray-500">دقة التصحيح</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">أدوات ذكية متكاملة</h2>
              <p className="mt-4 text-xl text-gray-600 italic">
                كل ما تحتاجه لإدارة منظومتك التعليمية في مكان واحد
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-gray-50 p-8 rounded-2xl border border-transparent hover:border-primary-200 transition-all text-center"
                  >
                    <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-6">
                      <feature.icon className={`h-10 w-10 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary-600 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">
              انضم إلى آلاف المعلمين وباشر تجربتك الذكية اليوم
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              ابدأ الآن في بناء اختباراتك الأولى واستكشف قوة الذكاء الاصطناعي في التعليم.
            </p>
            <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-primary-600 font-bold hover:bg-primary-50 transition-colors shadow-lg"
            >
              ابدأ مجاناً الآن
              <ArrowRight className="mr-2 h-5 w-5 rtl:rotate-180" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </section>

        <footer className="bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
              <div className="col-span-1 md:col-span-2">
                <span className="text-2xl font-bold text-white mb-6 block">{productName}</span>
                <p className="max-w-xs leading-relaxed italic">
                  منصة تعليمية متطورة تهدف إلى تسهيل عملية التقييم الدراسي وتطوير المهارات الرقمية للمعلم والطالب في الجزائر.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">المنصة</h4>
                <ul className="space-y-4">
                  <li><Link href="#mission" className="hover:text-white transition-colors">رسالتنا</Link></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">المميزات</Link></li>
                  <li><Link href="/legal/help" className="hover:text-white transition-colors">مركز المساعدة</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">قانوني</h4>
                <ul className="space-y-4">
                  <li><Link href="/legal/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
                  <li><Link href="/legal/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center">
              <p className="text-sm">
                © {new Date().getFullYear()} {productName} | المهندسة أحلام. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-4">
                 <span className="text-xs">الجزائر</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
