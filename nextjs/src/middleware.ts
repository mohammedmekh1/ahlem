import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't need auth
  const publicRoutes = ['/exam/', '/api/exam/', '/pricing', '/api/stripe/webhook'];
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|terms|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
