'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, RefreshCw, Copy, CheckCircle2, BookOpen, ClipboardList, Lightbulb } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }

const suggestions = [
  { icon: BookOpen,     text: 'اشرح لي مفهوم التفاضل والتكامل',          category: 'شرح' },
  { icon: ClipboardList,text: 'أنشئ لي 5 أسئلة عن الفيزياء النووية',     category: 'اختبار' },
  { icon: Lightbulb,    text: 'كيف أحسّن أسلوبي في الدراسة؟',            category: 'نصيحة' },
  { icon: Brain,        text: 'لخّص لي درس الكيمياء العضوية',             category: 'تلخيص' },
];

export default function AIAssistantPage() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const responses: Record<string, string> = {
      'شرح': 'بالتأكيد! سأشرح لك هذا المفهوم بطريقة مبسطة:\n\n**المفهوم الأساسي:** التفاضل يقيس معدل التغيير الفوري لدالة ما، بينما التكامل يقيس المساحة تحت منحنى الدالة.\n\n**مثال عملي:** إذا كانت لديك دالة الموضع s(t)، فإن مشتقتها s\'(t) تعطيك السرعة الآنية.\n\nهل تريد أمثلة أكثر تفصيلاً؟',
      'اختبار': 'إليك 5 أسئلة تدريبية:\n\n**السؤال 1:** ما هو عدد البروتونات في نواة الكربون-12؟\n**السؤال 2:** ما الفرق بين الانشطار النووي والاندماج النووي؟\n**السؤال 3:** ما هي وحدة قياس النشاط الإشعاعي؟\n**السؤال 4:** اذكر تطبيقين للطاقة النووية في الحياة اليومية.\n**السؤال 5:** ما هو عمر النصف وكيف يُحسب؟',
      'نصيحة': 'إليك أفضل الاستراتيجيات للدراسة المثمرة:\n\n✅ **تقنية Pomodoro:** 25 دقيقة تركيز + 5 دقائق راحة\n✅ **التكرار المتباعد:** راجع المادة بعد يوم، ثم أسبوع، ثم شهر\n✅ **التدريس للآخرين:** اشرح المادة كأنك تشرحها لطالب آخر\n✅ **الأسئلة التدريبية:** حل تمارين من اختبارات سابقة',
      'تلخيص': 'ملخص الكيمياء العضوية:\n\n**المركبات العضوية** هي مركبات تحتوي على الكربون.\n\n**أهم المجموعات الوظيفية:**\n- الهيدروكسيل (-OH): الكحولات\n- الكربونيل (C=O): الألدهيدات والكيتونات\n- الكربوكسيل (-COOH): الأحماض العضوية\n\n**الروابط الكيميائية:** الكربون يكوّن 4 روابط تساهمية.',
    };
    const category = suggestions.find(s => msg.includes(s.text.split(' ')[1]))?.category || 'شرح';
    const responseText = responses[category] || `فهمت سؤالك عن: "${msg}"\n\nكمساعد تعليمي متخصص في منصة EXAM، يمكنني مساعدتك في:\n• شرح المفاهيم الدراسية\n• إنشاء أسئلة تدريبية\n• تقديم نصائح للدراسة\n• تلخيص الدروس\n\nكيف يمكنني مساعدتك أكثر؟`;
    setMessages(prev => [...prev, { role: 'assistant', content: responseText, timestamp: new Date() }]);
    setLoading(false);
  };

  const copyMsg = async (idx: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">مساعد EXAM الذكي</h1>
          <p className="text-sm text-gray-400">مدعوم بالذكاء الاصطناعي لدعمك في رحلتك التعليمية</p>
        </div>
        <span className="mr-auto exam-badge exam-badge-success flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> متصل
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto exam-card p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4 animate-float">
              <Sparkles className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">كيف يمكنني مساعدتك اليوم؟</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-sm">اسألني عن أي موضوع دراسي، أو اطلب مني إنشاء اختبار، أو احصل على نصائح للدراسة.</p>
            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0">
                    <s.icon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-indigo-700">{s.text}</span>
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
              <div className={`max-w-[80%] relative group`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
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
              <div className="flex gap-1">
                {[0, 1, 2].map(j => (
                  <div key={j} className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="exam-card p-3 flex items-end gap-2">
        <button onClick={() => setMessages([])} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0" title="محادثة جديدة">
          <RefreshCw className="h-4 w-4" />
        </button>
        <textarea
          className="exam-input flex-1 resize-none min-h-[44px] max-h-32 py-2.5"
          placeholder="اكتب سؤالك هنا..."
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="exam-btn-primary shrink-0 px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
