// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-token');

  const protectedUrl = request.nextUrl.pathname.startsWith('/dashboard');

  // URL yang diizinkan tanpa token
  const allowedUrls = ['/signin', '/signup', '/'];

  if (protectedUrl && !token) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  if (token && allowedUrls.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}