'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Brain, FileText, Plus, Save, Upload, Trash } from 'lucide-react';

export default function QuestionBank() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);

  // Manual Form State
  const [manualQuestion, setManualQuestion] = useState({
    content: '',
    type: 'mcq',
    difficulty: 'medium',
    explanation: ''
  });

  // AI Form State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: orgs } = await supabase.from('organization_members').select('organization_id');
      if (orgs && orgs.length > 0) {
        const { data: subs } = await supabase.from('subjects').select('*').in('organization_id', orgs.map(o => o.organization_id));
        if (subs) {
          setSubjects(subs);
          if (subs.length > 0) setSelectedSubject(subs[0].id);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  useEffect(() => {
    if (selectedSubject) {
      async function fetchQuestions() {
        const { data } = await supabase.from('questions').select('*').eq('subject_id', selectedSubject);
        if (data) setQuestions(data);
      }
      fetchQuestions();
    }
  }, [selectedSubject, supabase]);

  const handleManualSave = async () => {
    if (!selectedSubject) return toast.error('اختر مادة دراسية أولاً');
    const { error } = await supabase.from('questions').insert({
      ...manualQuestion,
      subject_id: selectedSubject
    });
    if (!error) {
      toast.success('تم حفظ السؤال');
      setManualQuestion({ content: '', type: 'mcq', difficulty: 'medium', explanation: '' });
      // Refresh list
    }
  };

  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);

      const formData = new FormData();
      formData.append('file', uploadedFile);

      toast.info('جاري استخراج النص من الملف...');
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        setAiPrompt(data.text);
        toast.success('تم استخراج النص، يمكنك الآن توليد الأسئلة');
      } else {
        toast.error(data.error || 'فشل استخراج النص');
      }
    }
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt, difficulty: aiDifficulty, count: 5 })
      });
      const data = await res.json();
      if (data.questions) {
        setPreviewQuestions(data.questions);
        toast.success('تم توليد الأسئلة');
      } else {
        toast.error(data.error || 'فشل توليد الأسئلة');
      }
    } catch (e) {
      toast.error('حدث خطأ');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAiQuestion = async (q: any) => {
    const { error } = await supabase.from('questions').insert({
      ...q,
      subject_id: selectedSubject
    });
    if (!error) {
      toast.success('تم حفظ السؤال بنجاح');
      setPreviewQuestions(previewQuestions.filter(pq => pq !== q));
    }
  };

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">بنك الأسئلة الذكي</h1>
        <div className="w-64">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المادة الدراسية" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual"><Plus className="w-4 h-4 ml-2" /> إضافة يدوية</TabsTrigger>
          <TabsTrigger value="ai"><Brain className="w-4 h-4 ml-2" /> توليد بالذكاء الاصطناعي</TabsTrigger>
          <TabsTrigger value="file"><Upload className="w-4 h-4 ml-2" /> رفع ملفات</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader><CardTitle>إضافة سؤال يدوياً</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="نص السؤال"
                value={manualQuestion.content}
                onChange={e => setManualQuestion({...manualQuestion, content: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={manualQuestion.type} onValueChange={v => setManualQuestion({...manualQuestion, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                    <SelectItem value="true_false">صح وخطأ</SelectItem>
                    <SelectItem value="essay">سؤال مقالي</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={manualQuestion.difficulty} onValueChange={v => setManualQuestion({...manualQuestion, difficulty: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">سهل</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">صعب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleManualSave}><Save className="ml-2 w-4 h-4" /> حفظ السؤال</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>توليد أسئلة ذكي (Gemini)</CardTitle>
              <CardDescription>صف موضوع المادة التعليمية وسيقوم الذكاء الاصطناعي بإنشاء بنك أسئلة لك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full p-2 border rounded-md h-32"
                placeholder="مثال: أسئلة حول قوانين نيوتن للحركة وتطبيقاتها..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <Button className="w-full" onClick={handleAiGenerate} disabled={isGenerating}>
                {isGenerating ? 'جاري التوليد...' : 'توليد الأسئلة'}
              </Button>

              {previewQuestions.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-bold">الأسئلة المقترحة:</h3>
                  {previewQuestions.map((q, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 flex justify-between items-start">
                        <div>
                          <p className="font-medium">{q.content}</p>
                          <p className="text-xs text-gray-500 capitalize">{q.type} - {q.difficulty}</p>
                        </div>
                        <Button size="sm" onClick={() => saveAiQuestion(q)}>اعتماد</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file">
          <Card>
            <CardHeader><CardTitle>استخراج الأسئلة من الملفات</CardTitle></CardHeader>
            <CardContent className="text-center py-12 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>قم برفع ملفات PDF لاستخراج المحتوى وتوليد أسئلة منه</p>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileUpload}
              />
              <Button className="mt-4" variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? file.name : 'اختر ملف PDF'}
                </label>
              </Button>
              {aiPrompt && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 mb-2">تم استخراج النص بنجاح!</p>
                  <Button onClick={() => handleAiGenerate()}>توليد أسئلة من هذا الملف</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">الأسئلة الموجودة في {subjects.find(s => s.id === selectedSubject)?.name}</h2>
        <div className="space-y-4">
          {questions.map(q => (
            <Card key={q.id}>
              <CardContent className="pt-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{q.content}</p>
                  <p className="text-xs text-gray-400">{q.type} | {q.difficulty}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500"><Trash className="w-4 h-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
