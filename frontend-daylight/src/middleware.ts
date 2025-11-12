import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/personality-test',
  '/personality-test/context',
  '/personality-test/result',
  '/auth/callback',
  '/auth/error',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Get token from cookie or localStorage will be checked on client
  const token = request.cookies.get('accessToken')?.value;
  
  // If trying to access protected route without token
  if (!isPublicRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // If trying to access auth pages while logged in
  if (isPublicRoute && token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};