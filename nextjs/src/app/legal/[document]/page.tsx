'use client';
import React from 'react';
import LegalDocument from '@/components/LegalDocument';
import { notFound } from 'next/navigation';

const legalDocuments = {
  privacy: { title: 'سياسة الخصوصية',  path: '/terms/privacy-notice.md' },
  terms:   { title: 'شروط الاستخدام',  path: '/terms/terms-of-service.md' },
  refund:  { title: 'سياسة الاسترداد', path: '/terms/refund-policy.md' },
} as const;

type DocKey = keyof typeof legalDocuments;

interface LegalPageParams { params: Promise<{ document: DocKey }> }

export default function LegalPage({ params }: LegalPageParams) {
  const { document } = React.use(params);
  if (!legalDocuments[document]) notFound();
  const { title, path } = legalDocuments[document];
  return <LegalDocument title={title} filePath={path} />;
}
