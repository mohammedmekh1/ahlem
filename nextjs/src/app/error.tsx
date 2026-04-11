'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50">
      <div className="exam-card p-10 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-9 w-9 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-gray-500 text-sm mb-6">نعتذر عن الإزعاج. يرجى المحاولة مرة أخرى.</p>
        {error.digest && <p className="text-xs text-gray-300 mb-6 font-mono">رمز الخطأ: {error.digest}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()} className="exam-btn-primary">
            <RefreshCw className="h-4 w-4" /> إعادة المحاولة
          </button>
          <button onClick={() => window.location.href = '/'} className="exam-btn-secondary">
            <Home className="h-4 w-4" /> الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
