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
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Get the session
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

  const { pathname } = request.nextUrl;

  // Allow auth callback route
  if (pathname === '/auth/callback') {
    return res;
  }

  // Check if the requested path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // If user is not authenticated, redirect to auth page
    if (!session) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user's role from the session
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role || 'user';

    // Check if user has required role for the route
    const requiredRoles = protectedRoutes[Object.keys(protectedRoutes).find(route => 
      pathname.startsWith(route)
    )];

    if (!requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }
  }

  // If user is authenticated and tries to access auth page, redirect to home
  if (pathname === '/auth' && session) {
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
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 