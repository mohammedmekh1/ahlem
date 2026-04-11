"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Link2, Copy, Check, Send, Plus, Trash2, CheckCircle, AlertCircle, Loader2, ExternalLink, Users } from 'lucide-react';

interface Exam { id: string; title: string; invite_code: string; status: string; }
interface Invitation { id: string; email: string; used_at: string | null; expires_at: string; created_at: string; }

export default function InvitePage() {
  const { id } = useParams() as { id: string };
  const [exam,    setExam]    = useState<Exam | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [emails,  setEmails]  = useState<string[]>(['']);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [msg,     setMsg]     = useState<{ type: 'success'|'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s  = await createSPASaaSClientAuthenticated();
      const db = s.getSupabaseClient();
      const [{ data: e }, { data: inv }] = await Promise.all([
        db.from('exams').select('id, title, invite_code, status').eq('id', id).single(),
        db.from('exam_invitations').select('*').eq('exam_id', id).order('created_at', { ascending: false }),
      ]);
      if (e) setExam(e as Exam);
      setInvitations((inv || []) as Invitation[]);
      setLoading(false);
    })();
  }, [id]);

  const examUrl = exam ? `${window.location.origin}/exam/${exam.invite_code}` : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(examUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const sendInvites = async () => {
    const valid = emails.map(e => e.trim()).filter(e => e && e.includes('@'));
    if (!valid.length) { setMsg({ type:'error', text:'أدخل إيميلاً صحيحاً على الأقل' }); return; }
    setSending(true); setMsg(null);
    try {
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: exam!.id, emails: valid, exam_title: exam!.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type:'success', text: data.note || `تم إرسال ${data.sent} دعوة بنجاح` });
      setEmails(['']);
      // Reload invitations
      const { createSPASaaSClientAuthenticated } = await import('@/lib/supabase/client');
      const s = await createSPASaaSClientAuthenticated();
      const { data: inv } = await s.getSupabaseClient().from('exam_invitations').select('*').eq('exam_id', id).order('created_at', { ascending: false });
      setInvitations((inv || []) as Invitation[]);
    } catch (e) { setMsg({ type:'error', text: e instanceof Error ? e.message : 'خطأ' }); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>;
  if (!exam)  return <div className="text-center py-16 text-gray-400">الاختبار غير موجود</div>;

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">دعوة الطلاب</h1>
        <p className="text-gray-500 text-sm mt-1">{exam.title}</p>
      </div>

      {/* Share Link */}
      <div className="exam-card p-5">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-indigo-500" /> رابط الاختبار العام
        </h2>
        <p className="text-xs text-gray-400 mb-3">شارك هذا الرابط مع أي طالب — لا يحتاج تسجيل حساب</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-mono truncate">
            {examUrl}
          </div>
          <button onClick={copyLink}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}>
            {copied ? <><Check className="h-4 w-4" />تم</> : <><Copy className="h-4 w-4" />نسخ</>}
          </button>
          <a href={examUrl} target="_blank" rel="noreferrer"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={`exam-badge text-xs ${exam.status === 'published' ? 'exam-badge-success' : 'exam-badge-warning'}`}>
            {exam.status === 'published' ? '✓ منشور — الرابط فعّال' : '⚠ مسودة — الرابط غير فعّال'}
          </span>
        </div>
      </div>

      {/* Email Invites */}
      <div className="exam-card p-5">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-500" /> دعوة عبر الإيميل
        </h2>
        <p className="text-xs text-gray-400 mb-4">أرسل دعوات مخصصة مباشرة لبريد الطلاب</p>

        {msg && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm mb-4 ${msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {msg.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            {msg.text}
          </div>
        )}

        <div className="space-y-2 mb-3">
          {emails.map((email, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="email" className="exam-input flex-1" placeholder={`student${i+1}@example.com`}
                value={email} onChange={e => { const arr = [...emails]; arr[i] = e.target.value; setEmails(arr); }} />
              {emails.length > 1 && (
                <button onClick={() => setEmails(emails.filter((_,j) => j !== i))}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setEmails([...emails, ''])}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            <Plus className="h-4 w-4" /> إضافة إيميل
          </button>
          <div className="flex-1" />
          <button onClick={sendInvites} disabled={sending}
            className="exam-btn-primary disabled:opacity-50">
            {sending ? <><Loader2 className="h-4 w-4 animate-spin" />جاري الإرسال...</>
              : <><Send className="h-4 w-4" />إرسال الدعوات</>}
          </button>
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
          💡 لإرسال إيميلات حقيقية، أضف <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> إلى ملف .env.local
        </div>
      </div>

      {/* Invitations list */}
      {invitations.length > 0 && (
        <div className="exam-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-800">الدعوات المرسلة ({invitations.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{inv.email}</p>
                  <p className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString('ar-DZ')}</p>
                </div>
                <span className={`exam-badge text-xs ${inv.used_at ? 'exam-badge-success' : new Date(inv.expires_at) < new Date() ? 'exam-badge-danger' : 'exam-badge-warning'}`}>
                  {inv.used_at ? '✓ مستخدمة' : new Date(inv.expires_at) < new Date() ? 'منتهية' : 'معلّقة'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
