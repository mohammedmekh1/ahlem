'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: orgs } = await supabase.from('organization_members').select('organization_id, role, organizations(name)');
      if (orgs) {
        // Can manage if owner, admin, teacher or assistant
        const leadOrgs = orgs
          .filter(m => ['owner', 'admin', 'teacher', 'assistant'].includes(m.role))
          .map(m => ({ id: m.organization_id, name: (m as any).organizations.name, role: m.role }));
        setOrganizations(leadOrgs);
        if (leadOrgs.length > 0) setSelectedOrg(leadOrgs[0].id);
      }

      const { data: examsData } = await supabase.from('exams').select('*');
      if (examsData) setExams(examsData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  useEffect(() => {
    if (selectedExamId) {
      async function fetchQuestions() {
        const { data } = await supabase.from('questions').select('*').eq('exam_id', selectedExamId);
        if (data) setQuestions(data);
      }
      fetchQuestions();
    }
  }, [selectedExamId, supabase]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return;

    const { data, error } = await supabase
      .from('questions')
      .insert({
        exam_id: selectedExamId,
        content: newQuestion
      })
      .select()
      .single();

    if (!error) {
      setQuestions([...questions, data]);
      setNewQuestion('');
      toast.success('تمت إضافة السؤال');
    } else {
      toast.error(`خطأ: ${error.message}`);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('exams')
      .insert({
        title: newExamTitle,
        organization_id: selectedOrg,
        created_by: user.id
      })
      .select()
      .single();

    if (!error) {
      setExams([...exams, data]);
      setNewExamTitle('');
      toast.success('تم إنشاء الاختبار بنجاح');
    } else {
      toast.error(`خطأ: ${error.message}`);
    }
  };

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">إدارة الاختبارات</h1>

      {organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء اختبار جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateExam} className="flex gap-4">
              <Input
                value={newExamTitle}
                onChange={(e) => setNewExamTitle(e.target.value)}
                placeholder="عنوان الاختبار"
                required
              />
              <Button type="submit">إنشاء</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id} className={selectedExamId === exam.id ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{exam.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">أنشئ في: {new Date(exam.created_at).toLocaleDateString()}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setSelectedExamId(exam.id)}>
                إدارة الأسئلة
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedExamId && (
        <Card>
          <CardHeader>
            <CardTitle>إدارة الأسئلة للاختبار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddQuestion} className="flex gap-4">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="أدخل سؤالاً جديداً"
                required
              />
              <Button type="submit">إضافة سؤال</Button>
            </form>
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="p-3 border rounded-md bg-gray-50">
                  {q.content}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
