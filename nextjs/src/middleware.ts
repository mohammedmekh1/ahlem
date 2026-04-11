import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public exam routes — no auth needed
  if (pathname.startsWith('/exam/') || pathname.startsWith('/api/exam/')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|terms|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
