import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define public routes (accessible without authentication)
const PUBLIC_ROUTES = [
  '/', 
  '/login', 
  '/signup', 
  '/about', 
  '/contact', 
  '/terms', 
  '/privacy', 
  '/not-authorized',
  '/login-manual',
  '/direct-test-page',
  '/order',        // Make these basic pages public so users can see them 
  '/gift-card',    // without login, but still check role for protected pages
  '/loyalty',
  '/bulk-order',
  '/menu',
  '/api/test-supabase',
  '/api/direct-test',
  '/api/signup-test',
  '/api/verify-project',
  '/api/test-supabase',
  '/test-supabase-connection'
];

// Define user-accessible routes (must be authenticated)
const USER_ROUTES = [
  '/profile',
];

// Define protected routes that require specific roles
const ADMIN_ROUTES = ['/admin'];
const SUPERADMIN_ROUTES = ['/superadmin'];

// Helper to check if URL starts with any pattern from an array
const urlStartsWith = (url, patterns) => {
  return patterns.some(pattern => url.pathname.startsWith(pattern));
};

export async function middleware(req) {
  console.log('Middleware running for path:', req.nextUrl.pathname);
  
  // Clone the request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-url', req.url);

  // Skip non-page routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.includes('.') // Skip image/asset requests
  ) {
    return NextResponse.next();
  }

  // Check if the route is public
  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
    console.log('Public route, allowing access');
    return NextResponse.next();
  }

  // Hardcode Supabase credentials to avoid issues with env variables
  const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';

  try {
    // Create Supabase client using cookies from the request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
        cookies: {
          get: (name) => {
            const cookies = req.cookies.getAll();
            const cookie = cookies.find((c) => c.name === name);
            return cookie?.value;
          },
        },
      },
    });

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    // If no session and route is not public, redirect to login
    if (!session) {
      console.log('No session, redirecting to login');
      // Store the intended destination for post-login redirect
      const url = new URL('/login', req.url);
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // User is authenticated, check for user routes
    if (urlStartsWith(req.nextUrl, USER_ROUTES)) {
      console.log('User route, authenticated user, allowing access');
      // Allow all authenticated users
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // User is authenticated, check role for protected routes
    if (urlStartsWith(req.nextUrl, ADMIN_ROUTES) || urlStartsWith(req.nextUrl, SUPERADMIN_ROUTES)) {
      console.log('Protected route, checking role');
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();

      // Handle missing profile
      if (!profile) {
        console.log('No profile found, access denied');
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }

      // Check access to admin routes
      if (urlStartsWith(req.nextUrl, ADMIN_ROUTES)) {
        // Only let admins and superadmins access admin routes
        if (!(profile.role === 'admin' || profile.role === 'superadmin')) {
          console.log('Not admin or superadmin, access denied');
          return NextResponse.redirect(new URL('/not-authorized', req.url));
        }
        
        // Check if admin is approved (only for admin role, superadmins are always approved)
        if (profile.role === 'admin' && profile.approved !== true) {
          console.log('Admin not approved, access denied');
          return NextResponse.redirect(new URL('/pending-approval', req.url));
        }
        
        console.log('Admin/superadmin accessing admin route, allowing access');
      }

      // Check access to superadmin routes
      if (urlStartsWith(req.nextUrl, SUPERADMIN_ROUTES)) {
        // Only let superadmins access superadmin routes
        if (profile.role !== 'superadmin') {
          console.log('Not superadmin, access denied to superadmin route');
          return NextResponse.redirect(new URL('/not-authorized', req.url));
        }
        console.log('Superadmin accessing superadmin route, allowing access');
      }
    }

    // Allow the request if all checks passed
    console.log('All checks passed, allowing access');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, allow the request to proceed 
    // (the page will handle authentication failure gracefully)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
}

// Run middleware on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/* (image files in public)
     * - icons/* (icon files in public)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
}; 