'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse hash from URL - this is important for the email verification flow
        const hashParams = window.location.hash
          ? Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)))
          : {};

        // Check for error in hash parameters
        if (hashParams.error_description) {
          setError(hashParams.error_description);
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        // Check if this is from email verification
        const isEmailVerification = hashParams.type === 'email_confirmation' || 
                                   window.location.href.includes('email_confirmation');
        
        if (isEmailVerification) {
          console.log('Processing email verification...');
        }

        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback session error:', sessionError);
          setError('There was an error verifying your session. Please try signing in again.');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        if (!session) {
          // If no session after callback, redirect to auth
          console.log('No session found after callback');
          router.push('/auth');
          return;
        }

        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, approved')
          .eq('id', session.user.id)
          .single();

        // If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Profile not found in callback, creating one...');
          
          // Create a new profile for the user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id, 
              email: session.user.email,
              role: session.user.user_metadata.role || 'user',
              approved: session.user.user_metadata.role === 'admin' ? false : true
            }]);
            
          if (insertError) {
            console.error('Error creating profile in callback:', insertError);
            setError('There was an error creating your user profile. Please try signing in again.');
            setTimeout(() => router.push('/auth'), 3000);
            return;
          }
          
          // Redirect to homepage
          router.push('/');
          return;
        } else if (profileError) {
          console.error('Auth callback profile error:', profileError);
          // If profile error, redirect to homepage
          router.push('/');
          return;
        }

        // Redirect based on role and approval status
        if (profile) {
          // For admin users, check if they're approved
          if (profile.role === 'admin' && !profile.approved) {
            router.push('/pending-approval');
            return;
          }
          
          // Redirect based on role
          switch (profile.role) {
            case 'superadmin':
              router.push('/superadmin');
              break;
            case 'admin':
              router.push('/admin');
              break;
            default:
              router.push('/');
          }
        } else {
          // If somehow no profile exists
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback unexpected error:', error);
        setError('An unexpected error occurred. Please try logging in again.');
        setTimeout(() => router.push('/auth'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto text-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="heading-2 mb-4 text-error">Authentication Error</h1>
            <p className="paragraph mb-6">{error}</p>
            <p className="text-text-secondary text-sm">Redirecting to login page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="heading-2 mb-4">Verifying your email...</h1>
          <p className="paragraph mb-6">Please wait while we complete the verification process.</p>
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 