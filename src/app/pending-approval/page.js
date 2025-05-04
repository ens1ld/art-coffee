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

  // Redirect if user should not be on this page
  useEffect(() => {
    if (!loading) {
      // If user is not logged in, redirect to login
      if (!user) {
        router.push('/login');
      } 
      // If user is an admin and already approved, redirect to admin
      else if (profile?.role === 'admin' && profile?.approved) {
        router.push('/admin');
      } 
      // If user is not an admin, redirect to home
      else if (profile?.role !== 'admin') {
        router.push('/');
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Waiting for Approval</h1>
          
          <p className="text-gray-600 mb-6">
            Your admin account is pending approval from a superadmin. 
            You'll receive notification when your account is approved.
          </p>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 mb-4">
              <p>While you wait, you can still use all customer features of Art Coffee.</p>
            </div>
            
            <Link
              href="/"
              className="inline-block w-full py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Return to Homepage
            </Link>
            
            <Link
              href="/order"
              className="inline-block w-full py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 transition-colors"
            >
              Place an Order
            </Link>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                If you have any questions, please contact the site administrator.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 