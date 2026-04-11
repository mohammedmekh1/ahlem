'use client';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'ar', label: 'العربية',   flag: '🇩🇿', dir: 'rtl' },
  { code: 'en', label: 'English',   flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', label: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', label: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe',   flag: '🇹🇷', dir: 'ltr' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const change = (lng: string, dir: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir  = dir;
    document.documentElement.lang = lng;
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors text-sm">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 overflow-hidden">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => change(l.code, l.dir)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${i18n.language === l.code ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
                {i18n.language === l.code && <span className="mr-auto text-indigo-400">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
