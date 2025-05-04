'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PendingApprovalPage() {
  const { profile, user, loading } = useProfile();
  const router = useRouter();

  // Redirect back to home if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // If user is already approved or not an admin, redirect them
    if (!loading && user && profile) {
      if (profile.role !== 'admin' || profile.approved) {
        router.push('/profile');
      }
    }
  }, [loading, user, profile, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-amber-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Approval Pending</h1>
          
          <p className="text-gray-600 mb-6">
            Your admin account is pending approval from a superadmin. You'll be able to access admin features once your account is approved.
          </p>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 mb-4">
              <p>In the meantime, you can still use all regular user features of the application.</p>
            </div>
            
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
                If you need urgent access or have questions, please contact a superadmin directly.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 