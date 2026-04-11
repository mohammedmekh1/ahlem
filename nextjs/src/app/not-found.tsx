import Link from 'next/link';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#f8fafc,#f0f4ff)' }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-8xl font-black mb-2" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">الصفحة غير موجودة</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          الصفحة التي تبحث عنها ربما تم نقلها، حذفها، أو أن الرابط غير صحيح.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="exam-btn-primary justify-center">
            <Home className="h-4 w-4" /> الصفحة الرئيسية
          </Link>
          <Link href="/app" className="exam-btn-secondary justify-center">
            <ArrowLeft className="h-4 w-4" /> لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
