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
    const prompt = `Generate ${count || 5} exam questions based on this description: ${description}.
    Difficulty level: ${difficulty || 'medium'}.
    Return as a JSON array of objects with fields: content (the question), type (mcq, true_false, essay), options (array of strings if mcq), correct_answer, explanation.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    const generatedText = result.candidates[0].content.parts[0].text;

    // Clean JSON from markdown if present
    const cleanJson = generatedText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleanJson);

    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
