'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function AuthContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/order';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Redirect based on role
          switch (profile.role) {
            case 'superadmin':
              router.push('/superadmin');
              break;
            case 'admin':
              router.push('/admin');
              break;
            default:
              router.push(redirectTo);
          }
        }
      }
    };
    checkSession();
  }, [router, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          } else if (signUpError.message.includes('password')) {
            throw new Error('Password must be at least 6 characters long.');
          } else {
            throw signUpError;
          }
        }

        if (user) {
          // Create profile with default 'user' role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              role: 'user'
            }]);

          if (profileError) {
            throw new Error('Failed to create user profile. Please try again.');
          }

          setSuccess('Please check your email to confirm your account.');
          setEmail('');
          setPassword('');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email before signing in.');
          } else {
            throw signInError;
          }
        }

        // Redirect will be handled by the useEffect
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-xl p-8">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500 bg-opacity-20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded bg-green-500 bg-opacity-20 text-green-500 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border border-card-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-card-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'btn-primary hover:bg-primary/90'
            }`}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className={`text-sm transition-colors ${
              isSignUp
                ? 'text-secondary hover:text-primary'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
} 