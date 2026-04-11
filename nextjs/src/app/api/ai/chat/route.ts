import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_STUDENT = `أنت مساعد تعليمي ذكي على منصة EXAM. مهمتك مساعدة الطلاب في:
- شرح المفاهيم الدراسية بأسلوب مبسط وواضح
- إنشاء أسئلة تدريبية
- تقديم نصائح للمذاكرة والتعلم
- تلخيص الدروس والمواد
أجب دائماً باللغة العربية ما لم يطلب المستخدم غير ذلك. كن مشجعاً وإيجابياً.`;

const SYSTEM_TEACHER = `أنت مساعد تعليمي متخصص للمعلمين على منصة EXAM. مهمتك:
- توليد أسئلة الاختبارات (اختيار متعدد، صح/خطأ، إجابة قصيرة، مقالية)
- تصميم الاختبارات وتوزيع الدرجات
- اقتراح خطط الدروس والأنشطة التعليمية
- تحليل أداء الطلاب وتقديم توصيات
عند توليد الأسئلة، قدمها بتنسيق واضح ومنظم مع الإجابات والشرح.
أجب باللغة العربية دائماً.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, isTeacher } = await req.json();
    const system = isTeacher ? SYSTEM_TEACHER : SYSTEM_STUDENT;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system,
        messages: messages.slice(-20), // last 20 messages for context
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error: ${response.status} — ${err.slice(0,200)}`);
    }

    const data   = await response.json();
    const content = data.content?.[0]?.text || 'عذراً، لم أستطع الرد.';
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { content: `حدث خطأ: ${err instanceof Error ? err.message : 'خطأ غير معروف'}. تأكد من إعداد Anthropic API.` },
      { status: 200 } // Return 200 to show error in chat gracefully
    );
  }
}
