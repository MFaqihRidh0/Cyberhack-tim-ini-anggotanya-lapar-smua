import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicPaths = ['/login', '/_next', '/favicon.ico', '/api'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For client-side auth check, we let the page load and handle redirect in the component
  // Next.js middleware can't access localStorage, so we rely on client-side protection
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
