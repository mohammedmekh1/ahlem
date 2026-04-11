'use client';
import { createSPAClient } from '@/lib/supabase/client';
import Link from "next/link";

type Provider = 'github' | 'google' | 'facebook' | 'apple';

interface SSOButtonsProps { onError?: (error: string) => void; }

const PROVIDER_CONFIGS = {
  github: {
    name: 'GitHub',
    icon: (
      <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
      </svg>
    ),
    bg: 'bg-gray-900 hover:bg-gray-800 border-gray-900',
    text: 'text-white',
  },
  google: {
    name: 'Google',
    icon: (
      <svg viewBox="0 0 20 20" className="w-5 h-5">
        <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
        <path d="M10 20c2.67 0 4.9-.89 6.57-2.43l-3.16-2.45c-.89.59-2.01.96-3.41.96-2.61 0-4.83-1.76-5.63-4.13H1.07v2.51C2.72 17.75 6.09 20 10 20z" fill="#34A853"/>
        <path d="M4.37 11.95c-.2-.6-.31-1.24-.31-1.95s.11-1.35.31-1.95V5.54H1.07C.38 6.84 0 8.36 0 10s.38 3.16 1.07 4.46l3.3-2.51z" fill="#FBBC05"/>
        <path d="M10 3.98c1.48 0 2.79.51 3.83 1.5l2.78-2.78C14.93 1.03 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.54l3.3 2.51C5.17 5.68 7.39 3.98 10 3.98z" fill="#EA4335"/>
      </svg>
    ),
    bg: 'bg-white hover:bg-gray-50 border-gray-200',
    text: 'text-gray-700',
  },
} as const;

function getEnabledProviders(): Provider[] {
  const str = process.env.NEXT_PUBLIC_SSO_PROVIDERS || '';
  return str.split(',').filter((p): p is Provider => p.trim().toLowerCase() in PROVIDER_CONFIGS);
}

export default function SSOButtons({ onError }: SSOButtonsProps) {
  const handleSSO = async (provider: Provider) => {
    try {
      const supabase = createSPAClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    }
  };

  const enabled = getEnabledProviders();
  if (enabled.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">أو تابع بـ</span>
        </div>
      </div>

      <div className="space-y-2">
        {enabled.map((provider) => {
          const cfg = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
          if (!cfg) return null;
          return (
            <button key={provider} onClick={() => handleSSO(provider)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cfg.bg} ${cfg.text} text-sm font-medium transition-all hover:shadow-sm`}>
              <span className="shrink-0">{cfg.icon}</span>
              <span className="flex-1 text-center">متابعة بـ {cfg.name}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        بتسجيلك، أنت توافق على{' '}
        <Link href="/legal/terms" className="text-indigo-600 hover:underline">شروط الاستخدام</Link>
        {' '}و{' '}
        <Link href="/legal/privacy" className="text-indigo-600 hover:underline">سياسة الخصوصية</Link>
      </p>
    </div>
  );
}
