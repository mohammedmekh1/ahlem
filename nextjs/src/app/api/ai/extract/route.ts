import { createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";

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
    let extractedText = "";

    if (file.name.endsWith('.pdf')) {
      const data = await pdf(buffer);
      extractedText = data.text;
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: "تنسيق الملف غير مدعوم. يرجى رفع ملف PDF أو Word (.docx)" }, { status: 400 });
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Extraction Error:", error);
    return NextResponse.json({ error: "فشل استخراج النص من الملف." }, { status: 500 });
  }
}
