'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const [userSession, setUserSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();

  // Get the redirectTo from URL or use default
  const getRedirectPath = (role = 'user') => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirectTo');
      if (redirectPath) return redirectPath;
      
      // Default redirects based on role
      if (role === 'superadmin') return '/superadmin';
      if (role === 'admin') return '/admin';
      return '/';
    }
    return '/';
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          setSessionChecked(true);
          return;
        }

        setUserSession(session);
        
        if (session) {
          // Get user profile to determine role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, approved')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setSessionChecked(true);
            return;
          }

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
                router.push(getRedirectPath());
            }
          } else {
            router.push(getRedirectPath());
          }
        } else {
          setSessionChecked(true);
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setFormStatus('loading');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: isAdminSignUp ? 'admin' : 'user',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // If user signs up as admin, set approved to false
        if (isAdminSignUp) {
          await supabase
            .from('profiles')
            .update({ approved: false })
            .eq('id', data.user.id);
        }
        
        setFormStatus('signup-success');
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to sign up. Please try again.');
      }
      
      setFormStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setFormStatus('loading');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Sign in the user
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        setFormStatus('signin-success');
        
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, approved')
          .eq('id', data.user.id)
          .single();

        // If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Profile not found, creating one...');
          
          // Create a new profile for the user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              email: data.user.email,
              role: 'user',
              approved: true
            }]);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw new Error('Failed to create user profile. Please contact support.');
          }
          
          // Redirect to default user page
          router.push(getRedirectPath('user'));
          return;
        } else if (profileError) {
          console.error('Error fetching profile after signin:', profileError);
          throw new Error('Failed to retrieve user profile. Please try again.');
        }

        // For admin users, check if they're approved
        if (profile && profile.role === 'admin' && !profile.approved) {
          router.push('/pending-approval');
          return;
        }

        // Redirect based on role
        if (profile) {
          switch (profile.role) {
            case 'superadmin':
              router.push('/superadmin');
              break;
            case 'admin':
              router.push('/admin');
              break;
            default:
              router.push(getRedirectPath(profile.role));
          }
        } else {
          router.push(getRedirectPath());
        }
      }
    } catch (err) {
      console.error('Signin error:', err);
      
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
      
      setFormStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in and has a session
  if (userSession && !sessionChecked) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="heading-2 mb-4">You are already logged in</h1>
            <p className="paragraph mb-6">Redirecting you to the appropriate page...</p>
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="heading-2 text-center mb-6">
              {!isSignUp ? 'Welcome Back' : isAdminSignUp ? 'Register as Admin' : 'Create an Account'}
            </h1>
            
            {formStatus === 'error' && (
              <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-error">{error}</p>
              </div>
            )}
            
            {formStatus === 'signup-success' && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg">
                <h3 className="font-medium text-lg text-success mb-2">Account Created!</h3>
                <p className="text-text-secondary">
                  {isAdminSignUp ? 
                    'Your admin account is pending approval from a superadmin. Please check your email to confirm your account before signing in.' : 
                    'Please check your email to confirm your account before signing in.'}
                </p>
              </div>
            )}
            
            {formStatus === 'signin-success' && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg">
                <h3 className="font-medium text-lg text-success mb-2">Success!</h3>
                <p className="text-text-secondary">
                  You are being redirected...
                </p>
              </div>
            )}
            
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder={isSignUp ? "6+ characters" : "Your password"}
                  required
                  minLength={6}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full flex items-center justify-center ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {formStatus === 'loading' ? 'Processing...' : ''}
                  </>
                ) : (
                  !isSignUp ? 'Sign In' : isAdminSignUp ? 'Register as Admin' : 'Create Account'
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
                      setFormStatus('');
                    }}
                    className="text-primary hover:text-primary-dark transition-colors text-sm block w-full"
                  >
                    Don&apos;t have an account? Sign up as Customer
                  </button>
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setIsAdminSignUp(true);
                      setError('');
                      setFormStatus('');
                    }}
                    className="text-primary hover:text-primary-dark transition-colors text-sm block w-full"
                  >
                    Sign up as Admin (requires approval)
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setIsAdminSignUp(false);
                    setError('');
                    setFormStatus('');
                  }}
                  className="text-primary hover:text-primary-dark transition-colors text-sm"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              By continuing, you agree to Art Coffee&apos;s{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 