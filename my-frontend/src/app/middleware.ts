// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ bảo vệ route /manage-users
  if (pathname.startsWith('/manage-users')) {
    const role = request.cookies.get('role')?.value;

    // Nếu không phải staff -> chuyển về dashboard
    if (role !== 'staff') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manage-users/:path*'],
};