'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

export default function NotAuthorizedPage() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not logged in, redirect to login
        router.push('/auth');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      setUserRole(profile?.role || 'user');
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <div className="flex-grow py-16 px-4 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 text-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          
          <h1 className="heading-1 mb-4">Access Denied</h1>
          
          <p className="paragraph mb-8">
            You don&apos;t have permission to access this area. This section requires a higher authorization level than your current {userRole} role.
          </p>
          
          <div className="space-y-4">
            <Link href="/" className="btn-primary inline-block">
              Return to Homepage
            </Link>
            
            <div>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/auth');
                }}
                className="text-primary hover:text-primary-dark transition-colors mt-2 inline-block"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 