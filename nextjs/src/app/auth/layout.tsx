import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#f0f4ff 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-center">مرحباً بك في EXAM</h2>
          <p className="text-white/70 text-center max-w-sm leading-relaxed">
            منصة التعليم الإلكتروني الأكثر تطوراً في الجزائر. سجّل دخولك وابدأ رحلتك التعليمية.
          </p>
          <div className="mt-12 space-y-4 w-full max-w-sm">
            {[
              ['🎓', 'دورات تعليمية متخصصة', 'محتوى موثوق ومحدّث'],
              ['🧠', 'اختبارات تفاعلية',      'تقييم فوري ودقيق'],
              ['📊', 'تحليلات متقدمة',         'تتبع تقدمك بسهولة'],
            ].map(([emoji, title, desc], i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="text-white font-medium text-sm">{title}</p>
                  <p className="text-white/50 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-500/10 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EXAM</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
        <div className="p-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} EXAM Platform. جميع الحقوق محفوظة.
        </div>
      </div>
    </div>
  );
}
