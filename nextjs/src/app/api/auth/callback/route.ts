import { NextResponse } from 'next/server'
import { createSSRSaaSClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code  = requestUrl.searchParams.get('code')
  const next  = requestUrl.searchParams.get('next') || '/app'

  if (code) {
    const supabase = await createSSRSaaSClient()
    const client   = supabase.getSupabaseClient()
    await supabase.exchangeCodeForSession(code)

    const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      return NextResponse.redirect(new URL('/auth/2fa', request.url))
    }
    return NextResponse.redirect(new URL(next, request.url))
  }
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
