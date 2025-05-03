'use client';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen bg-background-DEFAULT flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="heading-2 mb-4">Access Denied</h1>
          
          <p className="paragraph mb-8">
            Sorry, you don&apos;t have permission to access this page. Please log in with an account that has the appropriate permissions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">
              Return to Homepage
            </Link>
            <Link href="/login" className="btn-secondary">
              Log In
            </Link>
          </div>
          
          <p className="mt-8 text-sm text-text-light">
            If you believe this is an error, please contact our support team at{' '}
            <a href="mailto:support@artcoffee.com" className="text-primary hover:underline">
              support@artcoffee.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
} 