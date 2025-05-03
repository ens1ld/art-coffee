import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/order', '/gift-card', '/loyalty', '/admin', '/superadmin'];
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!session) {
      // Redirect to auth page if not authenticated
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Role-based access control
    if (req.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (req.nextUrl.pathname.startsWith('/superadmin') && profile?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 