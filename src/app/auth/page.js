'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useProfile } from '@/components/ProfileFetcher';

// Component to handle params
function AuthContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, profile, refreshUserAndProfile } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTimeout = useRef(null);

  // Get redirect path from URL, fallback to /profile
  const redirectTo = searchParams.get('redirectTo') || '/profile';

  // When user or profile changes, check if we can redirect
  useEffect(() => {
    if (user && profile) {
      // Clear any existing timeout
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }

      // Navigate based on user role
      if (profile.role === 'admin' && profile.approved) {
        router.push('/admin');
      } else if (profile.role === 'superadmin') {
        router.push('/superadmin');
      } else if (profile.role === 'user' || (profile.role === 'admin' && !profile.approved)) {
        router.push('/profile');
      }
    }
  }, [user, profile, router]);

  // In case redirect doesn't happen automatically after 3 seconds
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role, // Store role in user metadata
          },
        },
      });
      
      if (authError) throw authError;
      
      // Create a profile for the new user
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              role: role,
              approved: role === 'admin' ? false : true, // Admins need approval
              created_at: new Date(),
              updated_at: new Date()
            });
          
          if (profileError) throw profileError;
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway as middleware will create profile if needed
        }
      }
      
      // Refresh the user and profile data
      await refreshUserAndProfile();
      
      setMessage('Account created! Check your email for the confirmation link.');
      
      // Set a timeout to redirect in case the auth state listener doesn't trigger
      redirectTimeout.current = setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } catch (error) {
      setError(error.message || 'An error occurred during sign up');
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // Refresh user and profile data
      await refreshUserAndProfile();
      
      setMessage('Signed in successfully! Redirecting...');
      
      // Set a timeout to redirect in case the auth state listener doesn't trigger
      redirectTimeout.current = setTimeout(() => {
        if (profile) {
          if (profile.role === 'admin' && profile.approved) {
            router.push('/admin');
          } else if (profile.role === 'superadmin') {
            router.push('/superadmin');
          } else {
            router.push('/profile');
          }
        } else {
          router.push('/profile');
        }
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to sign in');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user && !error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-amber-50">
          <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="text-center mb-6">
              <Image src="/logo.png" alt="Art Coffee Logo" width={80} height={80} className="mx-auto" />
              <h1 className="text-2xl font-bold text-amber-900 mt-4">You&apos;re signed in!</h1>
            </div>
            <p className="text-center mb-6">Redirecting you to your profile...</p>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent align-[-0.125em]"></div>
            </div>
            <div className="text-center mt-6">
              <button 
                onClick={() => router.push('/profile')}
                className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 transition-colors"
              >
                Go to Profile Now
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center bg-amber-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <Image src="/logo.png" alt="Art Coffee Logo" width={80} height={80} className="mx-auto" />
              <h1 className="text-2xl font-bold text-amber-900 mt-4">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSignUp ? 'Join Art Coffee today' : 'Sign in to your account'}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={loading}
                />
              </div>

              {isSignUp && (
                <>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="role" className="block text-gray-700 mb-2">
                      Account Type
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                    >
                      <option value="user">Customer</option>
                      <option value="admin">Admin (requires approval)</option>
                    </select>
                    {role === 'admin' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Admin accounts require superadmin approval before access is granted.
                      </p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-amber-800 text-white py-2 rounded hover:bg-amber-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setMessage('');
                }}
                className="text-amber-800 hover:text-amber-700"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don&apos;t have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Main Auth component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-amber-50">
          <div className="text-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-800 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-amber-900">Loading authentication...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
} 