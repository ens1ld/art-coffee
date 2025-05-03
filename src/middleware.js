import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define public routes (accessible without authentication)
const PUBLIC_ROUTES = ['/', '/auth', '/login', '/signup', '/about', '/contact', '/terms', '/privacy'];

// Define protected routes that require specific roles
const ADMIN_ROUTES = ['/admin'];
const SUPERADMIN_ROUTES = ['/superadmin'];

// Define user routes that require authentication but no special role
const USER_ROUTES = ['/profile', '/order', '/loyalty', '/gift-card', '/bulk-order', '/dashboard'];

// Helper to check if URL starts with any pattern from an array
const urlStartsWith = (url, patterns) => {
  return patterns.some(pattern => url.pathname.startsWith(pattern));
};

export async function middleware(req) {
  // Clone the request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-url', req.url);

  // Create Supabase client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          requestHeaders.set('Set-Cookie', `${name}=${value}; Path=/; SameSite=Lax; HttpOnly;${options?.maxAge ? ` Max-Age=${options.maxAge};` : ''}`);
        },
        remove: (name) => {
          requestHeaders.set('Set-Cookie', `${name}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly;`);
        },
      },
    }
  );

  try {
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
      return NextResponse.next();
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    // If no session and route is not public, redirect to login
    if (!session) {
      const url = new URL('/auth', req.url);
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // User is authenticated, check for user routes
    if (urlStartsWith(req.nextUrl, USER_ROUTES)) {
      // We already verified they're authenticated, just let them through
      // But verify they have a profile - if not, we'll create one in the profile page
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // User is authenticated, check role for protected routes
    if (urlStartsWith(req.nextUrl, ADMIN_ROUTES) || urlStartsWith(req.nextUrl, SUPERADMIN_ROUTES)) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();

      // Handle missing profile
      if (!profile) {
        return NextResponse.redirect(new URL('/profile', req.url));
      }

      // Check access to admin routes
      if (urlStartsWith(req.nextUrl, ADMIN_ROUTES)) {
        // Only let approved admins and superadmins access admin routes
        if (!(
          (profile.role === 'admin' && profile.approved) || 
          profile.role === 'superadmin'
        )) {
          return NextResponse.redirect(new URL('/not-authorized', req.url));
        }
      }

      // Check access to superadmin routes
      if (urlStartsWith(req.nextUrl, SUPERADMIN_ROUTES)) {
        // Only let superadmins access superadmin routes
        if (profile.role !== 'superadmin') {
          return NextResponse.redirect(new URL('/not-authorized', req.url));
        }
      }
    }

    // Allow the request if all checks passed
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