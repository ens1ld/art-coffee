import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Define route protections by role
const routeProtections = {
  // Public routes (accessible without login)
  public: ['/', '/login', '/signup', '/not-authorized', '/pending-approval', '/setup'],
  
  // User routes (require login, but any role can access)
  user: ['/order', '/gift-card', '/loyalty', '/bulk-order', '/profile'],
  
  // Admin routes (require admin or superadmin role)
  admin: ['/admin'],
  
  // Superadmin routes (require superadmin role only)
  superadmin: ['/superadmin']
};

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Required for middleware to update session if needed
  let session = null;

  try {
    // Get session (this will refresh the session if needed)
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session = currentSession;
    
    // Skip auth for API routes and static files
    if (
      req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.includes('.') // Static files like images, etc.
    ) {
      return res;
    }
    
    // Handle path matching
    const path = req.nextUrl.pathname;
    
    // Check for root path and subpaths that don't need exact matching
    const inPublicRoute = routeProtections.public.some(route => 
      route === path || 
      (route.endsWith('/') && path.startsWith(route)) ||
      (path === '/' && route === '/')
    );
    
    // Also check for specific subpaths that should be protected
    // For example, /admin/users should be protected like /admin
    const inUserRoute = routeProtections.user.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
    
    const inAdminRoute = routeProtections.admin.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
    
    const inSuperadminRoute = routeProtections.superadmin.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
    
    // If in a public route, always allow access
    if (inPublicRoute) {
      return res;
    }
    
    // All other routes require authentication
    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      // Add a redirect parameter to return after login
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    // At this point, user is authenticated
    
    // Get user role from session
    const userRole = session.user?.user_metadata?.role || 'user';
    
    // Check if user profile and role are properly established
    let hasValidProfile = false;
    
    try {
      // Check if profile exists and get approval status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        // Profile doesn't exist or can't be accessed - force profile creation
        if (profileError.code === 'PGRST116') { // Record not found error
          console.log('Profile not found, attempting to create it');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              role: userRole,
              approved: userRole === 'user', // Only auto-approve user roles
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          if (insertError) {
            console.error('Failed to create profile:', insertError);
            // Redirect with error
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('error', 'profile');
            redirectUrl.searchParams.set('message', 'Failed to create user profile');
            return NextResponse.redirect(redirectUrl);
          }
          
          // Re-fetch profile to get latest data
          const { data: newProfile, error: refetchError } = await supabase
            .from('profiles')
            .select('role, approved')
            .eq('id', session.user.id)
            .single();
            
          if (refetchError) {
            // Still can't access profile, redirect to error
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('error', 'profile');
            redirectUrl.searchParams.set('message', 'Failed to verify user profile');
            return NextResponse.redirect(redirectUrl);
          }
          
          hasValidProfile = true;
          
          // Check if admin but not approved - redirect to pending page
          if (newProfile.role === 'admin' && !newProfile.approved) {
            // Redirect admin to pending approval page
            return NextResponse.redirect(new URL('/pending-approval', req.url));
          }
        } else {
          // Other database errors - security policy, DB connection, etc.
          console.error('Profile error in middleware:', profileError);
          
          // Try to continue without profile data, falling back to metadata
          if (userRole === 'user') {
            hasValidProfile = true; // Continue with basic access if user role
          } else {
            // For admin/superadmin, we need to verify profile status
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('error', 'profile');
            redirectUrl.searchParams.set('message', 'Unable to verify permissions');
            return NextResponse.redirect(redirectUrl);
          }
        }
      } else {
        // Profile exists
        hasValidProfile = true;
        
        // Check if admin but not approved - redirect to pending page
        if (profileData.role === 'admin' && !profileData.approved) {
          // Only redirect if trying to access admin pages
          if (inAdminRoute) {
            return NextResponse.redirect(new URL('/pending-approval', req.url));
          }
        }
        
        // If role in profile differs from metadata, update metadata for consistency
        if (profileData.role !== userRole) {
          // Update user metadata to match profile (profile is source of truth)
          await supabase.auth.updateUser({
            data: { role: profileData.role }
          });
        }
      }
    } catch (error) {
      console.error('Error accessing profile in middleware:', error);
      
      // If we can't verify profile, fallback to metadata
      if (userRole === 'user') {
        hasValidProfile = true; // Continue with basic access if user role
      } else {
        // For admin/superadmin, we need to verify profile status
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('error', 'profile');
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // Now, enforce route protections based on role
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    const isSuperadmin = userRole === 'superadmin';
    
    // Allow access based on role hierarchy
    if (inUserRoute) {
      // All authenticated users can access user routes
      return res;
    } else if (inAdminRoute) {
      // Only admin and superadmin can access admin routes
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
      
      return res;
    } else if (inSuperadminRoute) {
      // Only superadmin can access superadmin routes
      if (!isSuperadmin) {
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
      
      return res;
    }
    
    // For any other routes, allow access for authenticated users
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // For critical errors, redirect to login with error param
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('error', 'middleware');
    redirectUrl.searchParams.set('message', 'An unexpected error occurred');
    return NextResponse.redirect(redirectUrl);
  }
}

// Only run middleware on pages, not on API routes or static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 