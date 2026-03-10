'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  const [examStats, setExamStats] = useState<any[]>([]);
  const [difficultQuestions, setDifficultQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      // 1. Fetch Exam Average Scores
      const { data: results } = await supabase
        .from('exam_results')
        .select('score, max_score, exams(title)');

      if (results) {
        const grouped = results.reduce((acc: any, curr: any) => {
          const title = curr.exams.title;
          if (!acc[title]) acc[title] = { name: title, total: 0, count: 0 };
          acc[title].total += (curr.score / curr.max_score) * 100;
          acc[title].count += 1;
          return acc;
        }, {});
        setExamStats(Object.values(grouped).map((g: any) => ({ ...g, average: Math.round(g.total / g.count) })));
      }

      // 2. Fetch Difficult Questions (Mocked for demonstration, would normally join with responses)
      setDifficultQuestions([
        { id: 1, text: 'سؤال حول قوانين نيوتن الثالث', failRate: 65 },
        { id: 2, text: 'سؤال حول التكامل المحدود', failRate: 48 },
        { id: 3, text: 'سؤال حول الثورة الجزائرية', failRate: 30 },
      ]);
      setLoading(false);
    }
    fetchStats();
  }, [supabase]);

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحليلات المتقدمة</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء العام</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              متوسط الدرجات لكل اختبار (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              أصعب الأسئلة (معدل الفشل)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {difficultQuestions.map((q) => (
                <div key={q.id} className="flex items-center justify-between border-b pb-2">
                  <div className="text-sm">{q.text}</div>
                  <div className="text-sm font-bold text-red-500">{q.failRate}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
