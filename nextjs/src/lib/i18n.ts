'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) =>
    import(`@/locales/${language}/${namespace}.json`)
      .catch(() => import('@/locales/ar/common.json'))
  ))
  .init({
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en', 'fr', 'es', 'tr', 'de'],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['cookie', 'localStorage', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18next;
