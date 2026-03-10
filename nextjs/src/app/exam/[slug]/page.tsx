'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function StudentExamPage() {
  const { slug } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [candidate, setCandidate] = useState<any>(null);
  const [step, setStep] = useState<'entry' | 'exam' | 'result'>('entry');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchExam() {
      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .eq('unique_slug', slug)
        .single();

      if (examData) {
        setExam(examData);
        const { data: qData } = await supabase
          .rpc('get_exam_questions', { exam_slug: slug });
        if (qData) setQuestions(qData);
      }
      setLoading(false);
    }
    fetchExam();
  }, [slug, supabase]);

  const handleEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;

    const { data, error } = await supabase
      .from('candidates')
      .insert({ exam_id: exam.id, full_name, email })
      .select()
      .single();

    if (!error) {
      setCandidate(data);
      setStep('exam');
    } else {
      toast.error('خطأ في التسجيل. ربما قمت بدخول هذا الاختبار مسبقاً.');
    }
  };

  const handleFinish = async () => {
    const response = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exam_id: exam.id,
        candidate_id: candidate.id,
        answers: answers
      })
    });

    const data = await response.json();

    if (response.ok) {
      setScore(data.score);
      setStep('result');
    } else {
      toast.error(data.error || 'فشل حفظ النتيجة');
    }
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;
  if (!exam) return <div className="p-10 text-center">الاختبار غير موجود</div>;

  if (step === 'entry') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <p className="text-gray-500">أدخل بياناتك للبدء في الاختبار</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEntry} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم الكامل</label>
                <Input name="full_name" required placeholder="أدخل اسمك" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input name="email" type="email" required placeholder="example@mail.com" />
              </div>
              <Button type="submit" className="w-full text-lg">بدء الاختبار</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-3xl">انتهى الاختبار!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold text-primary-600">{score}</div>
            <p className="text-xl">درجتك النهائية من أصل {questions.reduce((acc, q) => acc + (q.points || 1), 0)}</p>
            <p className="text-gray-500">شكراً لمشاركتك.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.reload()}>الرجوع للرئيسية</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-700">{exam.title}</h2>
            <span className="text-sm text-gray-500">السؤال {currentIndex + 1} من {questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="min-h-[400px] flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-2xl font-medium leading-relaxed">
              {currentQuestion?.content}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion?.type === 'mcq' && (currentQuestion.options as string[])?.map((option, idx) => (
              <Button
                key={idx}
                variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                className="w-full justify-start text-right h-auto py-4 text-lg"
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
              >
                {option}
              </Button>
            ))}
            {currentQuestion?.type === 'true_false' && ['صح', 'خطأ'].map((option) => (
              <Button
                key={option}
                variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                className="w-full justify-start text-right h-auto py-4 text-lg"
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
              >
                {option}
              </Button>
            ))}
            {currentQuestion?.type === 'essay' && (
              <textarea
                className="w-full p-4 border rounded-lg h-40"
                placeholder="أدخل إجابتك هنا..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              السابق
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">إنهاء الاختبار</Button>
            ) : (
              <Button onClick={() => setCurrentIndex(currentIndex + 1)}>التالي</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
