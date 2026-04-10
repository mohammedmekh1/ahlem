'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Users, Brain, BookOpen,
  ClipboardList, BarChart3, Star, CheckCircle,
  GraduationCap, Zap, Globe, ChevronRight, Menu, X
} from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: Shield,       title: 'مصادقة متقدمة',     desc: 'تسجيل دخول آمن مع MFA وSSO وحماية متعددة الطبقات',    color: 'from-violet-500 to-purple-600' },
    { icon: Brain,        title: 'تصحيح بالذكاء الاصطناعي', desc: 'إنشاء الأسئلة وتصحيحها تلقائياً بتقنيات الذكاء الاصطناعي', color: 'from-blue-500 to-cyan-600' },
    { icon: BookOpen,     title: 'إدارة الدورات',      desc: 'منشئ دورات كامل مع محتوى فيديو ونصوص وتقييمات',  color: 'from-emerald-500 to-teal-600' },
    { icon: ClipboardList,title: 'نظام الاختبارات',    desc: 'اختبارات تفاعلية مع توقيت وتحليلات فورية',          color: 'from-orange-500 to-amber-600' },
    { icon: BarChart3,    title: 'لوحة التحليلات',     desc: 'تتبع تقدم الطلاب بمخططات وتقارير تفصيلية',         color: 'from-rose-500 to-pink-600' },
    { icon: Users,        title: 'لوحة الإدارة',       desc: 'إدارة المستخدمين والصلاحيات وإعدادات المنصة',      color: 'from-indigo-500 to-blue-600' },
  ];

  const stats = [
    { label: 'طالب مسجّل', value: '10K+',  icon: GraduationCap },
    { label: 'دورة تعليمية', value: '500+', icon: BookOpen },
    { label: 'معدل النجاح',  value: '94%',  icon: Star },
    { label: 'وقت التشغيل', value: '99.9%', icon: Zap },
  ];

  const testimonials = [
    { name: 'سارة المحمدي', role: 'مديرة التعليم', text: 'منصة EXAM غيّرت طريقة تقييمنا للطلاب. الواجهة سهلة والتقارير دقيقة جداً.', rating: 5 },
    { name: 'أحمد الزهراني', role: 'أستاذ جامعي',  text: 'أداة رائعة لإنشاء الاختبارات. وفّرت علي ساعات من العمل اليدوي.', rating: 5 },
    { name: 'نور العلي',     role: 'طالبة دكتوراه', text: 'تجربة التعلم ممتازة والمتابعة الفورية للنتائج تحفزني على الاستمرار.', rating: 5 },
  ];

  const plans = [
    { name: 'مجاني',    price: '0',   period: '/شهر', features: ['5 دورات', '50 طالب', 'اختبارات أساسية', 'دعم بريد إلكتروني'],           popular: false, cta: 'ابدأ مجاناً' },
    { name: 'احترافي', price: '49',  period: '/شهر', features: ['دورات غير محدودة', '500 طالب', 'ذكاء اصطناعي', 'تحليلات متقدمة', 'دعم أولوية'], popular: true,  cta: 'ابدأ التجربة' },
    { name: 'مؤسسي',   price: '199', period: '/شهر', features: ['كل شيء في الاحترافي', 'طلاب غير محدودين', 'API مخصص', 'مدير حساب', 'SLA مضمون'], popular: false, cta: 'تواصل معنا' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                EXAM
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {[['#features','الميزات'],['#pricing','الأسعار'],['#testimonials','آراء العملاء']].map(([href, label]) => (
                <Link key={href} href={href} className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
                  {label}
                </Link>
              ))}
              <LanguageSwitcher />
              <AuthAwareButtons variant="nav" />
            </div>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen
                ? <X className={`h-6 w-6 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
                : <Menu className={`h-6 w-6 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {[['#features','الميزات'],['#pricing','الأسعار'],['#testimonials','آراء العملاء']].map(([href, label]) => (
              <Link key={href} href={href} className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileOpen(false)}>{label}</Link>
            ))}
            <AuthAwareButtons variant="nav" />
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero-bg pt-24 pb-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-8 animate-fade-in">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            منصة التعليم الإلكتروني الأكثر تطوراً
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight animate-fade-in stagger-1">
            تعلّم بلا حدود<br />
            <span className="exam-gradient-text">مع منصة EXAM</span>
          </h1>
          <p className="mt-6 text-xl text-white/70 max-w-2xl mx-auto animate-fade-in stagger-2">
            منصة تعليمية متكاملة تجمع بين الذكاء الاصطناعي وأدوات التقييم المتقدمة لتجربة تعليمية استثنائية
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3">
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
              ابدأ مجاناً <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all">
              استكشف الميزات <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Floating Cards Preview */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in stagger-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                <s.icon className="h-6 w-6 text-indigo-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="exam-badge exam-badge-primary mb-4">الميزات</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4">كل ما تحتاجه في مكان واحد</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              منصة EXAM مبنية بأحدث التقنيات لتوفير تجربة تعليمية سلسة ومتكاملة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="course-card p-6 group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="exam-badge exam-badge-success mb-4">آراء العملاء</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4">ماذا يقول مستخدمونا؟</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="exam-card p-6">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="exam-badge exam-badge-warning mb-4">الأسعار</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4">اختر الخطة المناسبة لك</h2>
            <p className="mt-4 text-lg text-gray-500">ابدأ مجاناً، وقم بالترقية عندما تكون مستعداً</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <div key={i} className={`relative rounded-2xl p-6 border-2 transition-all ${p.popular ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white shadow-xl scale-105' : 'border-gray-200 bg-white'}`}>
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${p.price}</span>
                    <span className="text-gray-400 text-sm">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${p.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Globe className="h-12 w-12 text-white/40 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-bold text-white mb-4">
            جاهز لتحويل تجربتك التعليمية؟
          </h2>
          <p className="text-xl text-white/70 mb-10">
            انضم إلى آلاف المعلمين والطلاب الذين يستخدمون EXAM يومياً
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-10 py-4 rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl"
          >
            ابدأ رحلتك التعليمية <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">EXAM</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                منصة التعليم الإلكتروني المتكاملة للمؤسسات والأفراد.
              </p>
            </div>
            {[
              { title: 'المنصة',   links: [['#features','الميزات'],['#pricing','الأسعار']] },
              { title: 'الحساب',  links: [['/auth/login','تسجيل الدخول'],['/auth/register','إنشاء حساب']] },
              { title: 'قانوني',  links: [['/legal/privacy','الخصوصية'],['/legal/terms','الشروط']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(([href, label], j) => (
                    <li key={j}><Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} EXAM Platform. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
