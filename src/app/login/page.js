'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [debug, setDebug] = useState({});
  
  // Use useEffect to mark when component has mounted on client
  useEffect(() => {
    setIsClient(true);
    console.log('Login page mounted on client');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setFormStatus('loading');
    setDebug({});

    try {
      console.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);
        setDebug(prev => ({ ...prev, authError: error }));
        throw error;
      }

      console.log('Login successful, user:', data.user.id);
      setDebug(prev => ({ ...prev, user: data.user }));

      // Get user role to determine redirection
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        setDebug(prev => ({ ...prev, profileError }));
        
        // If no profile exists, create one automatically
        console.log('Creating default user profile');
        const { error: insertError, data: insertData } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: 'user',
              approved: true,
              created_at: new Date().toISOString()
            },
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error('Profile creation error:', insertError);
          setDebug(prev => ({ ...prev, insertError }));
        } else {
          console.log('Created new profile:', insertData);
          profile = insertData;
          setDebug(prev => ({ ...prev, createdProfile: insertData }));
        }
      } else {
        console.log('Found existing profile:', profile);
        setDebug(prev => ({ ...prev, profile }));
      }

      setFormStatus('success');
      
      // Force a small delay before redirection to ensure state updates
      setTimeout(() => {
        try {
          // Determine redirect URL
          let redirectUrl = '/order'; // Default
          
          if (profile) {
            switch (profile.role) {
              case 'superadmin':
                redirectUrl = '/superadmin';
                break;
              case 'admin':
                redirectUrl = '/admin';
                break;
              default:
                redirectUrl = '/order';
            }
          }
          
          console.log(`Redirecting to ${redirectUrl}`);
          setDebug(prev => ({ ...prev, redirectUrl }));
          
          // Use window.location for more reliable navigation
          window.location.href = redirectUrl;
        } catch (navError) {
          console.error('Navigation error:', navError);
          setDebug(prev => ({ ...prev, navError }));
          // Fallback to router.push
          router.push('/');
        }
      }, 500);
    } catch (error) {
      console.error('Login process error:', error);
      setError(error.message || 'An error occurred during login');
      setFormStatus('error');
      setDebug(prev => ({ ...prev, finalError: error }));
    } finally {
      setLoading(false);
    }
  };

  // Only render the form if we're on the client
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="heading-2">Welcome Back</h1>
            <p className="mt-4 paragraph">
              Log in to your Art Coffee account to order, track rewards, and more.
            </p>
          </div>

          <div className="card mt-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 bg-error/10 border border-error/30 rounded text-error text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full btn-primary flex justify-center items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {formStatus === 'loading' && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {formStatus === 'loading' ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-4">
            <p className="text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-primary-dark transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-text-light text-xs">
              By logging in, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
          
          {Object.keys(debug).length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg overflow-auto">
              <h3 className="font-bold mb-2 text-sm">Debug Info:</h3>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
} 