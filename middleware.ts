// Middleware for route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disabled - Firebase Auth uses client-side persistence (IndexedDB/localStorage)
  // Route protection is handled by individual page components checking auth state
  
  // TODO: Implement proper server-side auth check using Firebase Admin SDK
  // For now, pages will handle their own auth redirects
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};

