'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SignupConfirmationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Try to get the email from localStorage if available
    const storedEmail = typeof window !== 'undefined' 
      ? localStorage.getItem('signupEmail') 
      : null;
    
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setResendStatus('sending');
    try {
      // Get the email from local storage or use a form
      const emailToUse = email || prompt('Please enter your email address');
      if (!emailToUse) {
        setResendStatus('');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
      });

      if (error) throw error;
      
      setResendStatus('success');
      setCountdown(60); // Set a 60 second countdown for next resend
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-900">Confirm Your Email</h1>
            <div className="mt-2">
              <svg className="mx-auto h-12 w-12 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md mt-6">
            <div className="text-center space-y-6">
              <p className="text-gray-600">
                We&apos;ve sent a confirmation email to:
              </p>
              
              {email ? (
                <p className="font-medium text-amber-900">{email}</p>
              ) : (
                <p className="italic text-gray-500">your email address</p>
              )}
              
              <div className="pt-2 pb-4">
                <p className="text-gray-600">
                  Please check your inbox and click the confirmation link to activate your account.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-600 mb-4">
                  Didn&apos;t receive the email?
                </p>
                
                <button
                  onClick={handleResendEmail}
                  disabled={countdown > 0 || resendStatus === 'sending'}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    countdown > 0 || resendStatus === 'sending'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-amber-800 hover:bg-amber-700'
                  }`}
                >
                  {resendStatus === 'sending' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend Confirmation Email'
                  )}
                </button>
                
                {resendStatus === 'success' && (
                  <p className="mt-3 text-sm text-green-600">
                    Confirmation email resent successfully!
                  </p>
                )}
                
                {resendStatus === 'error' && (
                  <p className="mt-3 text-sm text-red-600">
                    Failed to resend confirmation email. Please try again.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already confirmed? <Link href="/login" className="font-medium text-amber-800 hover:text-amber-700">Sign in here</Link>
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm font-medium text-amber-800 hover:text-amber-700">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 