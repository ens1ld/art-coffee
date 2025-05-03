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
      
      // Determine redirect path
      let redirectPath = redirectTo;
      console.log(`Original redirectTo from URL: ${redirectTo}`);
      
      // For immediate redirect to non-profile pages
      if (redirectPath && 
          redirectPath !== '/profile' && 
          (redirectPath.includes('/order') || 
           redirectPath.includes('/gift-card') || 
           redirectPath.includes('/loyalty'))) {
        console.log(`Redirecting to content page: ${redirectPath}`);
        
        // Use window.location for reliable navigation to content pages
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath;
          return;
        }
      }
      
      // For profile and admin pages, try to get user role first
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Check for infinite recursion error specifically
          if (profileError.message && profileError.message.includes('infinite recursion')) {
            setError('Database policy error detected. Please ask an administrator to run the fix-recursion.sql script.');
            setLoading(false);
            return;
          }
          throw profileError;
        }
        
        if (profile) {
          console.log('Profile data for redirect:', profile);
          if (profile.role === 'admin' && profile.approved) {
            redirectPath = '/admin';
          } else if (profile.role === 'superadmin') {
            redirectPath = '/superadmin';
          } else {
            redirectPath = '/profile';
          }
        }
      } catch (profileError) {
        console.error('Error getting profile for redirect:', profileError);
        // Default to profile page
        redirectPath = '/profile';
      }
      
      console.log(`Final redirect path: ${redirectPath}`);
      
      // Use a simple approach for navigation
      if (typeof window !== 'undefined') {
        // Set a small timeout to ensure state updates have time to propagate
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  // When user is signed in but there might be an error
  if (user && !error && message) {
    return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-amber-50">
          <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="text-center mb-6">
              <Image src="/images/logo.png" alt="Art Coffee Logo" width={80} height={80} className="mx-auto" />
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
=======
=======
>>>>>>> Stashed changes
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-900">You're signed in!</h2>
          <p className="text-amber-700 mt-2">Redirecting you to your profile...</p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-900"></div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          </div>
        )}
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center bg-amber-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <Image src="/images/logo.png" alt="Art Coffee Logo" width={80} height={80} className="mx-auto" />
              <h1 className="text-2xl font-bold text-amber-900 mt-4">
                {!isSignUp ? 'Welcome Back' : 
                 isAdminSignUp ? 'Create Admin Account' : 'Create Customer Account'}
              </h1>
              <p className="text-gray-600 mt-2">
                {!isSignUp ? 'Sign in to your account' : 
                 isAdminSignUp ? 'Admin accounts require approval' : 'Join Art Coffee today'}
              </p>
            </div>
=======
=======
>>>>>>> Stashed changes
    <div>
      <h2 className="text-2xl font-bold text-center text-amber-900 mb-1">
        {!isSignUp ? 'Welcome Back' : 
         isAdminSignUp ? 'Create Admin Account' : 'Create Customer Account'}
      </h2>
      <p className="text-center text-amber-700 mb-6">
        {!isSignUp ? 'Sign in to your account' : 
         isAdminSignUp ? 'Admin accounts require approval' : 'Join Art Coffee today'}
      </p>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

      {message && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 mb-4">
          <p>{message}</p>
        </div>
      )}
      
      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="flex justify-center my-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
        </div>
      )}

      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            disabled={loading}
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            disabled={loading}
            placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
          />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={loading}
              placeholder="Confirm your password"
            />
          </div>
        )}

        {isAdminSignUp && (
          <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-800">
            <p><strong>Note:</strong> Admin accounts require approval from a superadmin before accessing admin features.</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-amber-800 text-white py-3 rounded-md hover:bg-amber-700 transition-colors font-medium"
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
              className="text-amber-800 hover:text-amber-700 font-medium"
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
              className="block w-full text-amber-800 hover:text-amber-700 font-medium"
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
            className="text-amber-800 hover:text-amber-700 font-medium"
          >
            Already have an account? Sign In
          </button>
        )}
      </div>
      
      {/* Debug button */}
      <div className="mt-4 text-center">
        <button 
          onClick={showDebugInfo}
          className="text-xs text-gray-500 hover:underline"
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
  );
}

// Main Auth component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-amber-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div></div>}>
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <Image 
                  src="/images/logo.png" 
                  alt="Art Coffee Logo" 
                  width={100} 
                  height={100} 
                  className="cursor-pointer"
                  priority
                />
              </Link>
            </div>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-amber-900">Art Coffee</h1>
              <p className="text-amber-700">Sign in to access your account</p>
            </div>
            <AuthContent />
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Having trouble? Contact support at <a href="mailto:support@artcoffee.com" className="text-amber-700 hover:underline">support@artcoffee.com</a></p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </Suspense>
  );
} 