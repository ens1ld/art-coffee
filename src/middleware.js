import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/order': ['user', 'admin', 'superadmin'],
  '/gift-card': ['user', 'admin', 'superadmin'],
  '/loyalty': ['user', 'admin', 'superadmin'],
  '/bulk-order': ['user', 'admin', 'superadmin'],
  '/admin': ['admin', 'superadmin'],
  '/superadmin': ['superadmin'],
};

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if the requested path is protected
  const path = req.nextUrl.pathname;
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some(route => path.startsWith(route));

  if (isProtectedRoute) {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();

    // If no session, redirect to login
    if (!session) {
      const redirectUrl = new URL('/auth', req.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user's role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // If no profile found, redirect to login
    if (!profile) {
      const redirectUrl = new URL('/auth', req.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user's role has access to the requested route
    const requiredRoles = Object.entries(PROTECTED_ROUTES)
      .find(([route]) => path.startsWith(route))?.[1] || [];

    if (!requiredRoles.includes(profile.role)) {
      // User doesn't have required role, redirect to not-authorized
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 