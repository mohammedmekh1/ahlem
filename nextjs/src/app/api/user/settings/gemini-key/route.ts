import { createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto/keys";

export async function POST(req: Request) {
  const supabase = await createSSRClient();
  const { key } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const encryptedKey = encrypt(key);

  const { error } = await supabase
    .from("profiles")
    .update({ encrypted_gemini_key: encryptedKey })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
