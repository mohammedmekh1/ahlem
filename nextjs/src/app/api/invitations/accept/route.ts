import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createServerAdminClient();
  const { token, user_id } = await req.json();

  if (!token || !user_id) {
    return NextResponse.json({ error: "Missing token or user_id" }, { status: 400 });
  }

  // 1. Validate the invitation
  const { data: invitation, error: invError } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  // 2. Security Check: Verify that the user_id belongs to the email on the invitation
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);

  if (userError || !userData.user || userData.user.email !== invitation.email) {
    return NextResponse.json({ error: "Unauthorized: User email does not match invitation" }, { status: 403 });
  }

  // 3. Update invitation status
  await supabase
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  // 4. Add user to organization
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: invitation.organization_id,
      user_id: user_id,
      role: invitation.role,
    });

  if (memberError) {
    console.error("Member insertion error:", memberError);
    return NextResponse.json({ error: "Failed to add user to organization" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
