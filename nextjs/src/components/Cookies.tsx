'use client';
import React, { useEffect, useState } from 'react';
import { Shield, X, Cookie } from 'lucide-react';
import { setCookie, getCookie } from 'cookies-next/client';
import Link from 'next/link';

const COOKIE_KEY = 'exam-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!getCookie(COOKIE_KEY)) setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const setCookieChoice = (value: string) => {
    setCookie(COOKIE_KEY, value, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-in">
      <div className="exam-card p-5 shadow-xl border-2 border-indigo-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Cookie className="h-4 w-4 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">إعدادات ملفات الارتباط</h3>
          </div>
          <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          نستخدم ملفات الارتباط لتحسين تجربتك على منصة EXAM. يمكنك قبولها أو رفضها.{' '}
          <Link href="/legal/privacy" className="text-indigo-600 hover:underline">اعرف المزيد</Link>
        </p>

        <div className="flex gap-2">
          <button onClick={() => setCookieChoice('accepted')}
            className="exam-btn-primary flex-1 justify-center text-xs py-2">
            <Shield className="h-3.5 w-3.5" /> قبول الكل
          </button>
          <button onClick={() => setCookieChoice('declined')}
            className="exam-btn-secondary flex-1 justify-center text-xs py-2">
            رفض
          </button>
        </div>
      </div>
    </div>
  );
}
