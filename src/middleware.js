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
  '/profile': ['user', 'admin', 'superadmin'],
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

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
      return res;
    }

    // Allow public routes for everyone, regardless of auth status
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      return res;
    }

    // Check if the requested path is a protected route
    const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some(route => 
      pathname.startsWith(route)
    );

    // If it's a protected route and there's no session, redirect to auth
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated, do role-based checks for protected routes
    if (session && isProtectedRoute) {
      // Get user's role from the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile in middleware:', profileError);
        
        // If profile not found, try to create one on the fly
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id, 
              email: session.user.email,
              role: 'user',
              approved: true
            }])
            .select('*')
            .single();
            
          if (insertError) {
            console.error('Error creating profile in middleware:', insertError);
            // If we couldn't create a profile, redirect to profile page to handle it
            return NextResponse.redirect(new URL('/profile', request.url));
          }
          
          // Use the newly created profile
          if (newProfile) {
            const userRole = newProfile.role || 'user';
            const isApproved = newProfile.approved ?? true;
            
            // Do role-based checks with new profile
            return handleRoleChecks(request, pathname, userRole, isApproved, res);
          }
        }
        
        // For any other profile error, let user proceed to profile page
        return NextResponse.redirect(new URL('/profile', request.url));
      }

      if (!profile) {
        console.warn('No profile found for authenticated user in middleware');
        return NextResponse.redirect(new URL('/profile', request.url));
      }

      const userRole = profile.role || 'user';
      const isApproved = profile.approved ?? true;
      
      return handleRoleChecks(request, pathname, userRole, isApproved, res);
    }

    return res;
  } catch (error) {
    console.error('Unexpected error in middleware:', error);
    // In case of any error, allow the request to proceed and let the page handle it
    return res;
  }
}

// Helper function to handle role-based checks
function handleRoleChecks(request, pathname, userRole, isApproved, res) {
  // For admin routes, check if the admin is approved
  if (userRole === 'admin' && !isApproved && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/pending-approval', request.url));
  }

  // Check if user has required role for the route
  const routePrefix = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  );
  
  if (routePrefix) {
    const requiredRoles = PROTECTED_ROUTES[routePrefix];
    if (!requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }
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