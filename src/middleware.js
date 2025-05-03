import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication for actions/transactions
const TRANSACTION_ROUTES = {
  '/order/checkout': ['user', 'admin', 'superadmin'],
  '/gift-card/purchase': ['user', 'admin', 'superadmin'],
  '/loyalty/redeem': ['user', 'admin', 'superadmin'],
  '/bulk-order/submit': ['user', 'admin', 'superadmin'],
};

// Define admin routes with their required roles
const ADMIN_ROUTES = {
  '/admin': ['admin', 'superadmin'],
  '/superadmin': ['superadmin'],
};

// Define role-specific redirects
const ROLE_REDIRECTS = {
  'user': '/order',
  'admin': '/admin',
  'superadmin': '/superadmin'
};

export async function middleware(request) {
  // Initialize Supabase client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin': ['admin', 'superadmin'],
    '/superadmin': ['superadmin'],
    '/order': ['user', 'admin', 'superadmin'],
    '/gift-card': ['user', 'admin', 'superadmin'],
    '/loyalty': ['user', 'admin', 'superadmin'],
    '/bulk-order': ['user', 'admin', 'superadmin'],
  };

  // Get the path from the request URL
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // If it's a protected route and there's no session, redirect to auth page
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access a role-restricted route
  if (session && isProtectedRoute) {
    // Get the user's role from the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      // Profile not found, redirect to not-authorized
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }

    // Check if the user's role is allowed for this route
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
      path === route || path.startsWith(`${route}/`)
    )?.[1] || [];

    if (!requiredRoles.includes(profile.role)) {
      // User doesn't have the required role, redirect to not-authorized
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }
  }

  // If user is authenticated and trying to access auth page, redirect to home
  if (session && path === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}; 