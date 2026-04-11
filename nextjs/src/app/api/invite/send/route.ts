import { NextRequest, NextResponse } from 'next/server';
import { createSSRSaaSClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { exam_id, emails, exam_title } = await req.json();
    if (!emails?.length) return NextResponse.json({ error: 'لا يوجد إيميلات' }, { status: 400 });

    const supabase = await createSSRSaaSClient();
    const db = supabase.getSupabaseClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مسجّل' }, { status: 401 });

    const { data: exam } = await db.from('exams').select('invite_code, teacher_id').eq('id', exam_id).single();
    if (!exam || exam.teacher_id !== user.id) return NextResponse.json({ error: 'غير مخوّل' }, { status: 403 });

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const examUrl = `${origin}/exam/${exam.invite_code}`;

    // Insert invitations
    const invitations = emails.map((email: string) => ({ exam_id, email: email.trim(), expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString() }));
    await db.from('exam_invitations').insert(invitations);

    // Send via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY;
    const sent: string[] = [];
    const failed: string[] = [];

    if (resendKey) {
      for (const email of emails) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: process.env.FROM_EMAIL || 'EXAM Platform <noreply@exam.dz>',
              to: [email.trim()],
              subject: `دعوة لاختبار: ${exam_title}`,
              html: `
                <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;border-radius:12px;text-align:center;margin-bottom:24px;">
                    <h1 style="color:white;margin:0;font-size:28px;">EXAM</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">منصة التعليم الإلكتروني</p>
                  </div>
                  <h2 style="color:#1f2937;">لديك دعوة لاختبار!</h2>
                  <p style="color:#6b7280;">تمت دعوتك للمشاركة في اختبار:</p>
                  <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
                    <strong style="color:#6366f1;font-size:18px;">${exam_title}</strong>
                  </div>
                  <a href="${examUrl}" style="display:inline-block;background:#6366f1;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">ابدأ الاختبار</a>
                  <p style="color:#9ca3af;font-size:12px;margin-top:24px;">أو انسخ هذا الرابط: ${examUrl}</p>
                  <p style="color:#9ca3af;font-size:11px;">الدعوة صالحة لـ 7 أيام</p>
                </div>
              `,
            }),
          });
          if (res.ok) sent.push(email); else failed.push(email);
        } catch { failed.push(email); }
      }
    } else {
      // No Resend — just save invitations
      sent.push(...emails);
    }

    return NextResponse.json({
      success: true,
      sent: sent.length,
      failed: failed.length,
      exam_url: examUrl,
      note: resendKey ? null : 'RESEND_API_KEY غير موجود — تم حفظ الدعوات فقط. أضف المتغير لإرسال إيميلات حقيقية.',
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'خطأ' }, { status: 500 });
  }
}
