import Link from 'next/link';
import { FileText, Shield, ChevronRight } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-6">اختر الوثيقة التي تريد الاطلاع عليها:</p>
      <div className="flex gap-4 justify-center">
        <Link href="/legal/privacy" className="exam-btn-secondary flex items-center gap-2">
          <Shield className="h-4 w-4" />سياسة الخصوصية <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href="/legal/terms" className="exam-btn-secondary flex items-center gap-2">
          <FileText className="h-4 w-4" />شروط الاستخدام <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
