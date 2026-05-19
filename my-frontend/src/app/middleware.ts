// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes không cần auth
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/home', '/about', '/contact', '/'];
  
  // Routes cần auth
  const protectedRoutes = ['/dashboard', '/profile', '/manage-users'];
  
  // Kiểm tra nếu route cần auth
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const jwt = request.cookies.get('jwt')?.value;
    
    // Nếu không có JWT -> redirect đến login
    if (!jwt) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Kiểm tra permission cho /manage-users (chỉ staff)
  if (pathname.startsWith('/manage-users')) {
    const role = request.cookies.get('role')?.value;
    if (role !== 'staff') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/manage-users/:path*'],
};