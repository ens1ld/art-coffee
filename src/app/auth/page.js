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
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, profile, refreshUserAndProfile } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTimeout = useRef(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Get redirect path from URL, fallback to /profile
  const redirectTo = searchParams.get('redirectTo') || '/profile';

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
    if (user && profile) {
      console.log('User authenticated, profile data:', profile);
      
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

  // In case redirect doesn't happen automatically after 5 seconds
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

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

      // Fetch profile using session user id
      console.log('Fetching profile for user:', signInData.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();
        
      console.log('Profile fetch result:', { 
        found: !!profile, 
        error: profileError?.message || null 
      });
        
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to retrieve user profile. Please try again.');
      }
      
      if (!profile) {
        console.error('No profile found for user ID:', signInData.user.id);
        
        // Try to create profile (fallback if trigger didn't work)
        try {
          console.log('Attempting to create missing profile...');
          const role = signInData.user.user_metadata?.role || 'user';
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: signInData.user.id, 
              email: signInData.user.email,
              role: role,
              approved: role === 'admin' ? false : true
            }])
            .select()
            .single();
            
          if (insertError) {
            console.error('Failed to create profile:', insertError);
            throw new Error('Failed to create user profile');
          }
          
          console.log('Created new profile:', newProfile);
          
          // Use this profile for redirection
          if (newProfile) {
            // Redirect based on newly created profile
            if (newProfile.role === 'admin' && newProfile.approved) {
              window.location.href = '/admin';
            } else if (newProfile.role === 'superadmin') {
              window.location.href = '/superadmin';
            } else {
              window.location.href = '/profile';
            }
            return;
          }
        } catch (e) {
          console.error('Error creating profile:', e);
          throw new Error('Failed to set up user profile');
        }
      }

      // Redirect by role if profile exists
      if (profile.role === 'admin' && profile.approved) {
        window.location.href = '/admin';
      } else if (profile.role === 'superadmin') {
        window.location.href = '/superadmin';
      } else {
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
      
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
            
            {/* Debug button */}
            <div className="mt-4 text-center">
              <button 
                onClick={showDebugInfo}
                className="text-xs text-gray-500 underline"
              >
                Debug Auth
              </button>
            </div>
            
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
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
                {!isSignUp ? 'Welcome Back' : 
                 isAdminSignUp ? 'Create Admin Account' : 'Create Customer Account'}
              </h1>
              <p className="text-gray-600 mt-2">
                {!isSignUp ? 'Sign in to your account' : 
                 isAdminSignUp ? 'Admin accounts require approval' : 'Join Art Coffee today'}
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

            {loading && (
              <div className="flex justify-center my-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
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
              )}

              {isAdminSignUp && (
                <div className="mb-4">
                  <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-800">
                    <p><strong>Note:</strong> Admin accounts require approval from a superadmin before accessing admin features.</p>
                  </div>
                </div>
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
              {!isSignUp ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setIsAdminSignUp(false);
                      setError('');
                      setMessage('');
                    }}
                    className="text-amber-800 hover:text-amber-700"
                  >
                    Don&apos;t have an account? Sign up as Customer
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setIsAdminSignUp(true);
                      setError('');
                      setMessage('');
                    }}
                    className="block w-full text-amber-800 hover:text-amber-700"
                  >
                    Sign up as Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setIsAdminSignUp(false);
                    setError('');
                    setMessage('');
                  }}
                  className="text-amber-800 hover:text-amber-700"
                >
                  Already have an account? Sign In
                </button>
              )}
            </div>
            
            {/* Debug button */}
            <div className="mt-4 text-center">
              <button 
                onClick={showDebugInfo}
                className="text-xs text-gray-500 underline"
              >
                Debug Auth
              </button>
            </div>
            
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
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