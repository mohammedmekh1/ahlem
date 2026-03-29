'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Brain, CheckCircle } from 'lucide-react';

export default function GradingPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase
        .from('exam_results')
        .select('*, exams(title), candidates(full_name, email)');
      if (data) setResults(data);
      setLoading(false);
    }
    fetchResults();
  }, [supabase]);

  const handleAiGrade = async (result: any) => {
    // Get the first essay question for this exam
    const { data: essayQ } = await supabase
      .from('questions')
      .select('id')
      .eq('exam_id', result.exam_id)
      .eq('type', 'essay')
      .limit(1)
      .single();

    if (!essayQ) return toast.error('لا توجد أسئلة مقالية في هذا الاختبار');

    toast.info('جاري التصحيح الذكي...');
    const res = await fetch('/api/ai/grade-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exam_id: result.exam_id,
        candidate_id: result.candidate_id,
        question_id: essayQ.id,
        criteria: "الدقة العلمية ووضوح الأفكار وسلامة اللغة"
      })
    });
    const data = await res.json();
    if (data.feedback) {
      toast.success('تم التصحيح بنجاح');
      // Refresh
    } else {
      toast.error(data.error || 'فشل التصحيح');
    }
  };

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">إدارة التصحيح والنتائج</h1>

      <Card>
        <CardHeader>
          <CardTitle>نتائج الطلاب الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-bold">{r.exams?.title}</p>
                  <p className="text-sm text-gray-600">الطالب: {r.candidates?.full_name}</p>
                  <p className="text-sm">الدرجة: <span className="font-bold">{r.score}/{r.max_score}</span></p>
                  {r.feedback && <p className="text-xs text-blue-600 mt-1">ملاحظة AI: {r.feedback}</p>}
                </div>
                <Button variant="secondary" onClick={() => handleAiGrade(r)}>
                  <Brain className="ml-2 w-4 h-4" /> تصحيح مقالي بالذكاء الاصطناعي
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
