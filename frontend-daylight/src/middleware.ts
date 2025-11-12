import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route yang bisa diakses tanpa login
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/personality-test',
  '/auth/callback',
  '/auth/error',
];

// Route auth yang tidak boleh diakses kalau sudah login
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware untuk routes yang match dengan pola tertentu
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Cek apakah route publik (bisa diakses tanpa login)
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Cek apakah route auth (login/register)
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Ambil token dari cookie
  const token = request.cookies.get('accessToken')?.value;
  
  // CASE 1: Akses route protected tanpa token → redirect ke /login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Hanya set redirect param jika bukan root
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }
  
  // CASE 2: Sudah login tapi akses /login atau /register → redirect ke /
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};