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

export async function middleware(req) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Public pages that don't require authentication
  const publicPages = ['/', '/about', '/contact', '/menu', '/login', '/signup', '/order', '/gift-card', '/loyalty', '/bulk-order'];
  
  // Allow viewing of public pages without authentication
  if (publicPages.includes(pathname)) {
    return res;
  }
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res;
  }
  
  // Create supabase middleware client
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // If user is not authenticated and trying to access transaction or admin routes
  const isTransactionRoute = Object.keys(TRANSACTION_ROUTES).some(route => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');
  
  if (!session && (isTransactionRoute || isAdminRoute)) {
    // User is not logged in, redirect to login
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is logged in, check role-based access for admin routes
  if (session && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    const userRole = profile?.role || 'user';
    
    // Admin only routes
    if (pathname.startsWith('/admin') && userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
    
    // Superadmin only routes
    if (pathname.startsWith('/superadmin') && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
  }
  
  return res;
}

export const config = {
  // Match all request paths except for static files, api routes, and _next files
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}; 