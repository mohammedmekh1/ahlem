import { createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: Request) {
  const supabase = await createSSRClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    const data = await pdf(buffer);
    const extractedText = data.text;

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: "فشل استخراج النص من الملف. تأكد من أن الملف ليس محمياً بكلمة سر." }, { status: 500 });
  }
}
