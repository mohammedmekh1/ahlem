import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { subject, count, type, difficulty, notes } = await req.json();
    const typeLabel = type === 'mcq' ? 'اختيار من متعدد (4 خيارات)' : type === 'true_false' ? 'صح أو خطأ' : 'إجابة قصيرة';

    const prompt = `أنت معلم خبير. أنشئ ${count} سؤال ${typeLabel} عن: "${subject}". الصعوبة: ${difficulty}. ${notes ? `تعليمات: ${notes}` : ''}
أعد JSON فقط بدون أي نص آخر:
{"questions":[{"question_text":"نص السؤال","question_type":"${type}","options":["أ","ب","ج","د"],"correct_answer":"أ","explanation":"لأن...","points":1}]}
للصح/الخطأ: options=["صح","خطأ"]. للإجابة القصيرة: options=[].`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('لم يُرجع JSON صحيح');
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ content: JSON.stringify(parsed) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'خطأ' }, { status: 500 });
  }
}
