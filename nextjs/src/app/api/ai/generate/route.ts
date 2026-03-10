import { createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto/keys";

export async function POST(req: Request) {
  const supabase = await createSSRClient();
  const { description, difficulty, count } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("encrypted_gemini_key")
    .eq("id", user.id)
    .single();

  let apiKey = profile?.encrypted_gemini_key;
  if (!apiKey) return NextResponse.json({ error: "Gemini API Key missing" }, { status: 400 });

  try {
    apiKey = decrypt(apiKey);
    const prompt = `أنت خبير في إنشاء الاختبارات التعليمية. قم بإنشاء ${count || 5} سؤالاً بناءً على الوصف التالي: ${description}.
    مستوى الصعوبة: ${difficulty || 'medium'}.

    المتطلبات:
    1. يجب أن تكون الأسئلة باللغة العربية (إلا إذا كان المحتوى يتطلب لغة أخرى).
    2. أنواع الأسئلة المتاحة: اختيار من متعدد (mcq)، صح وخطأ (true_false)، مقالي (essay).
    3. بالنسبة لأسئلة الاختيار من متعدد، قدم 4 خيارات.

    الرد يجب أن يكون بصيغة JSON فقط كصفوف مصفوفة (JSON array) تحتوي على الكائنات التالية:
    - content: نص السؤال
    - type: نوع السؤال (mcq, true_false, essay)
    - options: مصفوفة من السلاسل النصية للخيارات (فقط لنوع mcq)
    - correct_answer: الإجابة الصحيحة
    - explanation: شرح بسيط للإجابة.

    تأكد من إرجاع JSON صالح فقط.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    const generatedText = result.candidates[0].content.parts[0].text;

    // Robust JSON cleaning
    let cleanJson = generatedText;
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    } else {
      cleanJson = generatedText.replace(/```json|```/g, '').trim();
    }

    try {
      const questions = JSON.parse(cleanJson);
      return NextResponse.json({ questions });
    } catch (parseError: any) {
      console.error("AI JSON Parse Error:", parseError, "Generated Text:", generatedText);
      return NextResponse.json({ error: "فشل في معالجة الأسئلة المولدة. يرجى المحاولة مرة أخرى." }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
