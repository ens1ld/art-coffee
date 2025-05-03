'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user role and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          redirectBasedOnRole(profile.role);
        }
      }
    };
    checkUser();
  }, []);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'superadmin':
        router.push('/superadmin');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Create user profile with default role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                role: 'user',
              },
            ]);

          if (profileError) throw profileError;

          setStatus('✅ Sign up successful! Please check your email to verify your account.');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user role and redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            redirectBasedOnRole(profile.role);
          }
        }
      }
    } catch (error) {
      console.error(error);
      setStatus(`❌ ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 bg-card-bg border border-card-border rounded-xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>

        {status && (
          <div className="mb-4 p-3 rounded bg-opacity-20 bg-primary text-primary text-sm">
            {status}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 input-primary rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 input-primary rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2 rounded"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-secondary hover:text-primary transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
} 