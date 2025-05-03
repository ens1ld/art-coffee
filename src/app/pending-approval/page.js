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

  // Redirect if user is not logged in or is not an admin waiting for approval
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile && (profile.role !== 'admin' || profile.approved)) {
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-amber-800 mb-4">Approval Pending</h1>
          
          <p className="text-gray-600 mb-6">
            Your admin account is pending approval from a superadmin. You&apos;ll be able to access the admin dashboard once your account is approved.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-amber-800 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors"
            >
              Return to Home
            </Link>
            
            <Link 
              href="mailto:superadmin@artcoffee.com"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Contact Superadmin
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Your request will be processed shortly. Thank you for your patience.</p>
            <p className="mt-2">Need help? Contact us at <Link href="mailto:support@artcoffee.com" className="text-amber-700 hover:underline">support@artcoffee.com</Link></p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 