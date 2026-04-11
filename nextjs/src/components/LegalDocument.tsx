"use client";
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, FileText } from 'lucide-react';

interface LegalDocumentProps { filePath: string; title: string; }

const LegalDocument: React.FC<LegalDocumentProps> = ({ filePath, title }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    fetch(filePath)
      .then(r => { if (!r.ok) throw new Error('فشل تحميل المستند'); return r.text(); })
      .then(t => { setContent(t); setLoading(false); })
      .catch(() => { setError('فشل تحميل المستند. يرجى المحاولة لاحقاً.'); setLoading(false); });
  }, [filePath]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <FileText className="h-5 w-5 text-indigo-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-gray-400">جاري التحميل...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="prose prose-gray max-w-none text-sm leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-100">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">{children}</h3>,
              p:  ({ children }) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-600">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-600">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
              hr: () => <hr className="my-6 border-gray-100" />,
              blockquote: ({ children }) => <blockquote className="border-r-4 border-indigo-200 pr-4 my-4 text-gray-500 italic">{children}</blockquote>,
              code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600">{children}</code>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default LegalDocument;
