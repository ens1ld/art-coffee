import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Define routes that don't need authentication at all
const PUBLIC_ROUTES = ['/', '/auth', '/auth/callback', '/super', '/about', '/contact', '/menu'];

// Define protected routes that require authentication
const PROTECTED_ROUTES = {
  '/admin': ['admin', 'superadmin'],
  '/superadmin': ['superadmin'],
  '/order': ['user', 'admin', 'superadmin'],
  '/gift-card': ['user', 'admin', 'superadmin'],
  '/loyalty': ['user', 'admin', 'superadmin'],
  '/bulk-order': ['user', 'admin', 'superadmin'],
  '/profile': ['user', 'admin', 'superadmin']
};

export async function middleware(request) {
  // Skip non-page routes (static files, api routes, etc.)
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing route: ${pathname}`);
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Middleware] Session error:', sessionError);
      return res;
    }

    if (session) {
      console.log(`[Middleware] Authenticated user: ${session.user.email}`);
    } else {
      console.log('[Middleware] No session found');
    }

    // Allow public routes for everyone, regardless of auth status
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      console.log(`[Middleware] Public route: ${pathname}, allowing access`);
      return res;
    }

    // Check if the requested path is a protected route
    const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some(route => 
      pathname.startsWith(route)
    );

    // If it's a protected route and there's no session, redirect to auth
    if (isProtectedRoute && !session) {
      console.log(`[Middleware] Protected route: ${pathname}, no session, redirecting to auth`);
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated, do role-based checks for protected routes
    if (session && isProtectedRoute) {
      console.log(`[Middleware] Protected route: ${pathname}, checking authorization for user: ${session.user.email}`);
      
      // Get user's role from the database
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();
      
      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        console.log(`[Middleware] Creating profile for user: ${session.user.id}`);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            role: 'user',
            approved: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('role, approved')
          .single();
        
        if (insertError) {
          console.error('[Middleware] Error creating profile:', insertError);
          
          // If we can't create the profile, let them proceed (the page will handle it)
          return res;
        }
        
        profile = newProfile;
        console.log(`[Middleware] New profile created: ${JSON.stringify(profile)}`);
      } else if (profileError) {
        console.error('[Middleware] Error fetching profile:', profileError);
        
        // If we can't get the profile but user is authenticated,
        // let them proceed (the page will handle any missing profile issues)
        return res;
      }

      if (!profile) {
        console.warn('[Middleware] No profile found for authenticated user');
        return res;
      }

      const userRole = profile.role || 'user';
      const isApproved = profile.approved ?? true;

      console.log(`[Middleware] User role: ${userRole}, Approved: ${isApproved}`);

      // For admin routes, check if the admin is approved
      if (userRole === 'admin' && !isApproved && pathname.startsWith('/admin')) {
        console.log('[Middleware] Admin not approved, redirecting to pending approval');
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }

      // Check if user has required role for the route
      const routePrefix = Object.keys(PROTECTED_ROUTES).find(route => 
        pathname.startsWith(route)
      );
      
      if (routePrefix) {
        const requiredRoles = PROTECTED_ROUTES[routePrefix];
        if (!requiredRoles.includes(userRole)) {
          console.log(`[Middleware] User role ${userRole} not authorized for ${pathname}, redirecting`);
          return NextResponse.redirect(new URL('/not-authorized', request.url));
        }
        
        console.log(`[Middleware] User authorized for ${pathname}`);
      }
    }

    return res;
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);
    // In case of any error, allow the request to proceed and let the page handle it
    return res;
  }
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