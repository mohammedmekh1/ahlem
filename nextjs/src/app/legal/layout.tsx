import Link from 'next/link';
import { GraduationCap, FileText, Shield, ChevronRight } from 'lucide-react';

const docs = [
  { href: '/legal/privacy', label: 'سياسة الخصوصية', icon: Shield },
  { href: '/legal/terms',   label: 'شروط الاستخدام', icon: FileText },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">EXAM</span>
          </Link>
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">الرئيسية</Link>
            <ChevronRight className="h-3 w-3" />
            <span>الصفحات القانونية</span>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <div className="exam-card p-3 sticky top-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">الوثائق</p>
            {docs.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 exam-card p-8">{children}</main>
      </div>
    </div>
  );
}
