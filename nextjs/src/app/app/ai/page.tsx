'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useGlobal, isTeacher } from '@/lib/context/GlobalContext';
import { Brain, Send, Sparkles, RefreshCw, Copy, CheckCircle2, BookOpen, ClipboardList, Lightbulb, Wand2, Link2 } from 'lucide-react';
import Link from 'next/link';

interface Message { role: 'user'|'assistant'; content: string; time: Date; }

const studentSuggestions = [
  { icon: BookOpen,     text: 'اشرح لي مفهوم التفاضل والتكامل بطريقة مبسطة' },
  { icon: ClipboardList,text: 'أنشئ لي 5 أسئلة تدريبية عن الفيزياء النووية' },
  { icon: Lightbulb,   text: 'كيف أحسّن أسلوبي في الدراسة والمذاكرة؟' },
  { icon: Brain,        text: 'لخّص لي درس الكيمياء العضوية بنقاط مهمة' },
];

const teacherSuggestions = [
  { icon: Wand2,       text: 'أنشئ 10 أسئلة اختيار متعدد عن الجبر الخطي مستوى متوسط' },
  { icon: ClipboardList,text: 'صمم اختباراً شاملاً لمادة التاريخ الحديث للثانوية' },
  { icon: BookOpen,    text: 'اقترح خطة درس لتدريس الدوال الرياضية' },
  { icon: Lightbulb,   text: 'كيف أقيّم مهارات الطلاب بشكل فعّال؟' },
];

export default function AIAssistantPage() {
  const { user } = useGlobal();
  const teacher  = isTeacher(user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState<number | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const suggestions = teacher ? teacherSuggestions : studentSuggestions;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Message = { role:'user', content: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: history, isTeacher: teacher }),
      });
      if (!res.ok) throw new Error('فشل الاتصال بالذكاء الاصطناعي');
      const data = await res.json();
      setMessages(prev => [...prev, { role:'assistant', content: data.content, time: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role:'assistant', content: `عذراً، حدث خطأ: ${e instanceof Error ? e.message : 'خطأ غير معروف'}`, time: new Date() }]);
    } finally { setLoading(false); }
  };

  const copyMsg = async (i: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(i); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">مساعد EXAM الذكي</h1>
          <p className="text-sm text-gray-400">{teacher ? 'أداة للمعلمين: توليد الأسئلة وتصميم الاختبارات' : 'مساعدك الشخصي للتعلم والمذاكرة'}</p>
        </div>
        <div className="flex items-center gap-2">
          {teacher && (
            <Link href="/app/teacher/exams/new" className="exam-btn-secondary text-xs py-1.5 px-3">
              <Wand2 className="h-3.5 w-3.5" /> إنشاء اختبار
            </Link>
          )}
          <span className="exam-badge exam-badge-success flex items-center gap-1 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> متصل
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto exam-card p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4 animate-float">
              <Sparkles className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {teacher ? 'ماذا تريد أن تنشئ اليوم؟' : 'كيف يمكنني مساعدتك؟'}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              {teacher ? 'يمكنني مساعدتك في توليد الأسئلة، تصميم الاختبارات، وإعداد خطط الدروس'
                       : 'اسألني عن أي موضوع دراسي، أو اطلب مني إنشاء أسئلة تدريبية'}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-right group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0">
                    <s.icon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-indigo-700 leading-snug">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="max-w-[80%] relative group">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                  {m.content}
                </div>
                {m.role === 'assistant' && (
                  <button onClick={() => copyMsg(i, m.content)}
                    className="absolute -bottom-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                    {copied === i ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === i ? 'تم النسخ' : 'نسخ'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">{[0,1,2].map(j=><div key={j} className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay:`${j*.15}s`}} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="exam-card p-3 flex items-end gap-2">
        <button onClick={() => setMessages([])} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg shrink-0" title="محادثة جديدة">
          <RefreshCw className="h-4 w-4" />
        </button>
        <textarea className="exam-input flex-1 resize-none min-h-[44px] max-h-32 py-2.5"
          placeholder={teacher ? 'اطلب توليد أسئلة أو تصميم اختبار...' : 'اسألني أي سؤال...'}
          rows={1} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="exam-btn-primary shrink-0 px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
