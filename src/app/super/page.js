'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SuperAdminAccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session, redirect to superadmin login
          const redirectUrl = new URL('/auth', window.location.origin);
          redirectUrl.searchParams.set('redirectTo', '/superadmin');
          router.push(redirectUrl.toString());
          return;
        }

        // Check if the user is a superadmin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.role === 'superadmin') {
          // If superadmin, redirect to superadmin dashboard
          router.push('/superadmin');
        } else {
          // Not a superadmin, show error briefly then redirect to home
          setError('Access denied: You need superadmin privileges to access this page.');
          setTimeout(() => router.push('/'), 3000);
        }
      } catch (error) {
        console.error('Error checking superadmin status:', error);
        setError('An error occurred. Please try again later.');
        setTimeout(() => router.push('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="mb-4 w-16 h-16 mx-auto text-error">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="heading-2 text-error mb-4">Access Denied</h1>
          <p className="paragraph mb-4">{error}</p>
          <p className="text-text-secondary text-sm">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return null; // This shouldn't be rendered as we're redirecting
} 