import { createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendInvitationEmail } from "@/lib/emails/invitation-service";

export async function POST(req: Request) {
  const supabase = await createSSRClient();
  const { email, organization_id, role } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = uuidv4();

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      email,
      organization_id,
      role,
      inviter_id: user.id,
      token,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Get Org Name for the email
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organization_id)
    .single();

  // Send the email (mocked)
  await sendInvitationEmail(email, org?.name || "منظمتنا", role, token);

  return NextResponse.json({ data });
}
