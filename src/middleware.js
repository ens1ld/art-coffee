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

// Helper function to safely extract role from profile or user metadata
const getUserRole = (profile, user) => {
  // Try from profile first
  if (profile && profile.role) {
    return profile.role;
  }
  
  // Then try from user metadata as fallback
  if (user && user.user_metadata && user.user_metadata.role) {
    return user.user_metadata.role;
  }
  
  // Default to 'user' if nothing is found
  return 'user';
};

// Helper to check if a user is an admin (admin or superadmin)
const isAdmin = (role) => {
  return role === 'admin' || role === 'superadmin';
};

// Helper to check if a user is a superadmin
const isSuperadmin = (role) => {
  return role === 'superadmin';
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
      const url = new URL('/login', req.url);
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      url.searchParams.set('error', 'session');
      return NextResponse.redirect(url);
    }

    // If no session and route is not public, redirect to login
    if (!session) {
      console.log('No session, redirecting to login');
      // Store the intended destination for post-login redirect
      const url = new URL('/login', req.url);
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    console.log('User authenticated:', session.user.email);

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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();

      // Handle missing profile or profile error
      if (profileError) {
        console.error('Profile error in middleware:', profileError);
        
        // If it's a recursion error or the table doesn't exist, try to check the metadata instead
        if (profileError.code === '42P01' || profileError.code === '42P17') {
          console.log('Falling back to user metadata for role check');
          // Use user metadata as a fallback
          const role = session.user.user_metadata?.role || 'user';
          const isApproved = session.user.user_metadata?.approved !== false;
          
          // Check access based on metadata
          if (urlStartsWith(req.nextUrl, ADMIN_ROUTES)) {
            if (!isAdmin(role)) {
              console.log('Not admin/superadmin based on metadata, access denied');
              return NextResponse.redirect(new URL('/not-authorized', req.url));
            }
            
            if (role === 'admin' && !isApproved) {
              console.log('Admin not approved based on metadata, access denied');
              return NextResponse.redirect(new URL('/pending-approval', req.url));
            }
          }
          
          if (urlStartsWith(req.nextUrl, SUPERADMIN_ROUTES) && !isSuperadmin(role)) {
            console.log('Not superadmin based on metadata, access denied');
            return NextResponse.redirect(new URL('/not-authorized', req.url));
          }
          
          console.log('Access granted based on metadata role:', role);
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
        
        // For other errors, redirect to login with error message
        const url = new URL('/login', req.url);
        url.searchParams.set('redirectTo', req.nextUrl.pathname);
        url.searchParams.set('error', 'profile');
        return NextResponse.redirect(url);
      }

      // Handle missing profile data
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
    
    // On error, redirect to login with error message
    const url = new URL('/login', req.url);
    url.searchParams.set('redirectTo', req.nextUrl.pathname);
    url.searchParams.set('error', 'middleware');
    url.searchParams.set('message', error.message || 'Unknown error');
    return NextResponse.redirect(url);
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