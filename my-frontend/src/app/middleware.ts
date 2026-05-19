// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes không cần auth
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/home', '/about', '/contact', '/'];
  
  // Routes chỉ staff mới vào
  const staffOnlyRoutes = ['/dashboard', '/manage-users'];
  
  // Routes cần auth (employee + staff)
  const protectedRoutes = ['/profile'];
  
  // Kiểm tra route staff-only
  if (staffOnlyRoutes.some(route => pathname.startsWith(route))) {
    const jwt = request.cookies.get('jwt')?.value;
    const role = request.cookies.get('role')?.value;
    
    if (!jwt) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    if (role !== 'staff') {
      const url = request.nextUrl.clone();
      url.pathname = '/profile';
      return NextResponse.redirect(url);
    }
  }

  // Kiểm tra route cần auth (employee + staff)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const jwt = request.cookies.get('jwt')?.value;
    
    if (!jwt) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/manage-users/:path*'],
};