'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useProfile } from '@/components/ProfileFetcher';

// Error Banner component
function ErrorBanner({ message }) {
  const isRecursionError = message && (
    message.includes('infinite recursion') || 
    message.includes('Database policy error')
  );

  return (
    <div className={`p-4 rounded mb-4 ${isRecursionError ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}>
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm font-medium">{isRecursionError ? 'Database Configuration Issue' : 'Error'}</p>
          <p className="text-sm">{message}</p>
          
          {isRecursionError && (
            <div className="mt-2 text-xs">
              <p>This is a known issue with the database security policies.</p>
              <p>Please ask an administrator to run the <code className="bg-gray-100 px-1 py-0.5 rounded">supabase/fix-recursion.sql</code> script in the Supabase SQL Editor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Auth Content component that handles authentication logic
function AuthContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const { user, profile, refreshProfile } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTimeout = useRef(null);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
    return () => {
      // Clean up any timeouts on unmount
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  // Get redirect path from URL, fallback to /profile
  const redirectTo = searchParams?.get('redirectTo') || '/profile';

  // Debug function
  const showDebugInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profileData } = session ? 
        await supabase.from('profiles').select('*').eq('id', session.user.id).single() :
        { data: null };
      
      setDebugInfo({
        sessionExists: !!session,
        userId: session?.user?.id || 'No user ID',
        userEmail: session?.user?.email || 'No email',
        profileExists: !!profileData,
        profileData: profileData || 'No profile data'
      });
    } catch (error) {
      setDebugInfo({error: error.message});
    }
  };

  // When user or profile changes, check if we can redirect
  useEffect(() => {
    if (!mounted) return;
    
    if (user && profile) {
      console.log('User authenticated, profile data:', profile);
      
      // Clear any existing timeout
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }

      // Navigate based on user role
      try {
        if (profile.role === 'admin' && profile.approved) {
          router.push('/admin');
        } else if (profile.role === 'superadmin') {
          router.push('/superadmin');
        } else if (profile.role === 'user' || (profile.role === 'admin' && !profile.approved)) {
          router.push('/profile');
        }
      } catch (err) {
        console.error('Navigation error:', err);
        // As a fallback, try to navigate to profile
        router.push('/profile');
      }
    }
  }, [user, profile, router, mounted]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      console.log('Starting sign up process...');
      const role = isAdminSignUp ? 'admin' : 'user';
      
      // Sign up with Supabase Auth
      console.log(`Signing up user with email: ${email}, role: ${role}`);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }, // Store role in user metadata
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      console.log('Sign up response:', { 
        success: !!authData?.user, 
        userId: authData?.user?.id,
        identities: authData?.user?.identities?.length,
        error: authError?.message || null 
      });
      
      if (authError) throw authError;
      
      if (!authData?.user) {
        console.error('No user data returned from sign up');
        throw new Error('No user data returned from sign up');
      }
      
      // Wait briefly to allow trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to verify the profile was created
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (profile) {
          console.log('Profile created successfully:', profile.id);
        } else if (profileError) {
          console.log('Profile check error (may still be created by trigger):', profileError.message);
        }
      } catch (e) {
        console.log('Error checking profile (non-critical):', e.message);
      }
      
      setMessage(`Account created! ${authData.user.identities?.length === 0 
        ? 'You can now sign in.' 
        : 'Check your email for the confirmation link.'}`);
        
      setIsSignUp(false);
      setIsAdminSignUp(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Sign up error:', error);
      setError(`Sign-up failed: ${error.message || 'Database error saving new user'}`);
      
      // Add debug info
      setDebugInfo({
        errorType: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    setDebugInfo(null); // Clear previous debug info

    try {
      console.log('Starting sign in process...');
      const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', { 
        success: !!signInData?.user, 
        userId: signInData?.user?.id,
        error: authError?.message || null 
      });
      
      if (authError) throw authError;
      if (!signInData?.user) throw new Error('No user returned from Supabase');
      
      // Update UI to show success
      setMessage('Login successful! Redirecting...');
      
      // Trigger profile refresh using the component's refreshUserAndProfile function
      if (refreshProfile) {
        try {
          await refreshProfile();
        } catch (refreshError) {
          console.error('Error refreshing profile:', refreshError);
          // Check for infinite recursion error
          if (refreshError && refreshError.message && refreshError.message.includes('infinite recursion')) {
            setError('Database policy error. Please ask an administrator to run the fix-recursion.sql script.');
            setLoading(false);
            return;
          }
          // Continue with login process even if refresh fails
        }
      }
      
      // If we get here, try to redirect based on user role
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, approved')
          .eq('id', signInData.user.id)
          .single();
          
        console.log('Profile data after login:', profileData);
        
        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
          throw profileError;
        }
        
        if (profileData) {
          console.log('Redirecting based on role:', profileData.role);
          
          // Set a timeout to allow for processing
          redirectTimeout.current = setTimeout(() => {
            // Use window.location for strongest redirect that overrides potential Next.js conflicts
            if (profileData.role === 'admin' && profileData.approved) {
              window.location.href = '/admin';
            } else if (profileData.role === 'superadmin') {
              window.location.href = '/superadmin'; 
            } else {
              // For regular users or unapproved admins
              window.location.href = '/profile';
            }
          }, 1000);
        } else {
          console.log('No profile data found, redirecting to profile page');
          redirectTimeout.current = setTimeout(() => {
            window.location.href = '/profile';
          }, 1000);
        }
      } catch (profileError) {
        console.error('Error in profile redirect flow:', profileError);
        // Fallback to default redirect
        redirectTimeout.current = setTimeout(() => {
          window.location.href = '/profile';
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error.message);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Format debug info for display
  const formatDebugInfo = () => {
    return JSON.stringify(debugInfo, null, 2);
  };

  // When user is signed in but there might be an error
  if (user && !error && message) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-amber-50">
          <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="text-center mb-6">
              <div className="bg-green-100 text-green-800 p-4 rounded-md">
                <h2 className="text-xl font-semibold">You are logged in</h2>
                <p>{message}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href={redirectTo} className="w-full block text-center py-2 px-4 bg-amber-800 hover:bg-amber-700 text-white rounded transition-colors">
                Go to Profile
              </Link>
            </div>
            {debugInfo && (
              <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
                <p className="font-semibold mb-1">Debug Info:</p>
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center bg-amber-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <Image src="/logo.svg" alt="Art Coffee" width={64} height={64} className="mx-auto mb-2" />
              <h1 className="text-2xl font-semibold text-amber-900">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600">
                {isSignUp ? 'Join Art Coffee today' : 'Sign in to your account'}
              </p>
            </div>

            {error && <ErrorBanner message={error} />}
            
            {message && !error && (
              <div className="p-4 rounded mb-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                <p>{message}</p>
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              
              {isSignUp && (
                <>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAdminSignUp}
                        onChange={() => setIsAdminSignUp(!isAdminSignUp)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Sign up as a manager (requires approval)
                      </span>
                    </label>
                  </div>
                </>
              )}
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Loading...</span>
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-center w-full text-sm text-amber-800 hover:text-amber-700"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : 'Need an account? Sign up'}
              </button>
            </div>
            
            {/* Dev tools */}
            <div className="mt-8">
              <button 
                onClick={showDebugInfo}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                type="button"
              >
                Show Debug Info
              </button>
              
              {debugInfo && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                    {formatDebugInfo()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Page component with error handling
export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
} 