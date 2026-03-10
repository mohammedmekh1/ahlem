import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Use Admin Client to bypass RLS for administrative tasks
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

  // 2. Update invitation status
  const { error: updateError } = await supabase
    .from("invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString()
    })
    .eq("id", invitation.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }

  // 3. Add user to organization
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: invitation.organization_id,
      user_id: user_id,
      role: invitation.role,
    });

  if (memberError) {
    // If membership fails, we might want to revert the invitation status,
    // but typically this fails because the user is already a member.
    console.error("Member insertion error:", memberError);
    return NextResponse.json({ error: "Failed to add user to organization" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
