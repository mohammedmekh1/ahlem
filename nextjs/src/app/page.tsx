'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Users, Database, Clock, Brain, Globe, Smartphone } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import HomePricing from "@/components/HomePricing";
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

  const features = [
    {
      icon: Shield,
      title: t('robust_auth', 'Authentication'),
      description: t('robust_auth_desc', 'Secure login with MFA and SSO'),
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      title: t('ai_correction', 'AI Correction'),
      description: t('ai_desc', 'Automatically create and correct questions with AI'),
      color: 'text-indigo-600'
    },
    {
      icon: Users,
      title: t('admin_panel', 'Admin Control'),
      description: t('admin_desc', 'Manage users, permissions and platform settings'),
      color: 'text-sky-600'
    },
    {
      icon: Database,
      title: t('storage', 'Secure Storage'),
      description: t('storage_desc', 'Integrated file management and sharing'),
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      title: t('productivity', 'Productivity'),
      description: t('productivity_desc', 'Advanced task management system'),
      color: 'text-blue-400'
    },
    {
      icon: Smartphone,
      title: t('mobile_ready', 'Mobile Ready'),
      description: t('mobile_desc', 'Complete Expo template for mobile devices'),
      color: 'text-blue-700'
    }
  ];

  const stats = [
    { label: t('active_users', 'Users'), value: '0' },
    { label: t('location', 'Location'), value: 'Algeria' },
    { label: t('uptime', 'Uptime'), value: '99.9%' },
    { label: t('support', 'Support'), value: '24/7' }
  ];

  return (
      <div className="min-h-screen">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                {productName}
              </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-900">
                  {t('features')}
                </Link>

                <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                  {t('pricing')}
                </Link>
                <Link
                    href="https://github.com/Razikus/supabase-nextjs-template"
                    className="text-gray-600 hover:text-gray-900"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  Documentation
                </Link>

                <Link
                    href="https://github.com/Razikus/supabase-nextjs-template"
                    className="bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  Grab This Template
                </Link>

                <AuthAwareButtons variant="nav" />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>

        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                {t('hero_title')}
                <span className="block text-primary-600 mt-2">{t('welcome')}</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                {t('hero_subtitle')}
              </p>
              <div className="mt-10 flex gap-4 justify-center">

                <AuthAwareButtons />
              </div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8">{t('founders')}</h2>
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <Users className="h-12 w-12 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold">أحلام</h3>
                  <p className="text-gray-500">{t('teacher')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-primary-600">{stat.value}</div>
                    <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Everything You Need</h2>
              <p className="mt-4 text-xl text-gray-600">
                Built with modern technologies for reliability and speed
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <HomePricing />

        <section className="py-24 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to Transform Your Idea into Reality?
            </h2>
            <p className="mt-4 text-xl text-primary-100">
              Join thousands of developers building their SaaS with {productName}
            </p>
            <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 border-b pb-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('location')}</h4>
              <p className="text-gray-600 italic">الجزائر</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Product</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#features" className="text-gray-600 hover:text-gray-900">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Resources</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="https://github.com/Razikus/supabase-nextjs-template" className="text-gray-600 hover:text-gray-900">
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600">
                © {new Date().getFullYear()} {productName}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}