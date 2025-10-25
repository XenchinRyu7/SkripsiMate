// Middleware for route protection with Firebase Auth
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/login',
  '/signup',
];

/**
 * Auth routes that authenticated users shouldn't access
 */
const authRoutes = [
  '/login',
  '/signup',
];

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/project',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has Firebase session (look for __session cookie)
  // Firebase stores auth in client-side localStorage/IndexedDB
  // We'll check for a custom session cookie we'll set client-side
  const sessionCookie = request.cookies.get('firebase-auth');
  const isAuthenticated = !!sessionCookie;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public assets (.svg, .png, .jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

