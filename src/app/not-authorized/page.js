'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function NotAuthorizedPage() {
  const { profile, user, loading } = useProfile();
  const router = useRouter();

  // Redirect back to home if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page. 
            {profile && profile.role && (
              <span> Your current role is <strong>{profile.role}</strong>.</span>
            )}
          </p>
          
          <div className="space-y-4">
            {profile && profile.role === 'admin' && !profile.approved && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 mb-4">
                <p>Your admin account is pending approval. Once your account is approved, you&apos;ll be able to access admin features.</p>
              </div>
            )}
            
            <Link
              href="/"
              className="inline-block w-full py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Return to Homepage
            </Link>
            
            <Link
              href="/profile"
              className="inline-block w-full py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 transition-colors"
            >
              View Your Profile
            </Link>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                If you believe you should have access to this page, please contact the administrator.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 