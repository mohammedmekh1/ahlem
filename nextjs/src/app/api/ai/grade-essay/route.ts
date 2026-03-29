import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto/keys";

export async function POST(req: Request) {
  const supabase = await createSSRClient();
  const { exam_id, candidate_id, question_id, student_answer, criteria } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get User's Gemini API Key
  const { data: profile } = await supabase
    .from("profiles")
    .select("encrypted_gemini_key")
    .eq("id", user.id)
    .single();

  let apiKey = profile?.encrypted_gemini_key;
  if (!apiKey) return NextResponse.json({ error: "Gemini API Key missing" }, { status: 400 });

  try {
    apiKey = decrypt(apiKey);

    // Fetch real student answer from DB
    const { data: resp } = await supabase
      .from("student_responses")
      .select("answer")
      .eq("candidate_id", candidate_id)
      .eq("question_id", question_id)
      .single();

    const actualAnswer = resp?.answer || student_answer;

    const prompt = `أنت مصحح أكاديمي خبير. قم بتقييم الإجابة التالية بناءً على المعايير المحددة:

    الإجابة: ${actualAnswer}
    المعايير: ${criteria}

    المطلوب:
    1. أعط درجة من 10.
    2. قدم ملاحظات (feedback) باللغة العربية تشرح سبب الدرجة وكيفية التحسين.

    الرد يجب أن يكون بصيغة JSON فقط:
    { "score": number, "feedback": "text" }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    const generatedText = result.candidates[0].content.parts[0].text;
    const cleanJson = generatedText.match(/\{[\s\S]*\}/)?.[0] || generatedText;
    const evaluation = JSON.parse(cleanJson);

    // Update result using Admin Client (to ensure write permission)
    const adminClient = await createServerAdminClient();

    // In a real scenario, we'd find the existing record and update it
    // For now, we update the main feedback field in exam_results
    await adminClient
      .from("exam_results")
      .update({ feedback: evaluation.feedback })
      .eq("exam_id", exam_id)
      .eq("candidate_id", candidate_id);

    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
