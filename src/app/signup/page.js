'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formStatus, setFormStatus] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setFormStatus('');
    
    // Basic form validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setFormStatus('loading');

    try {
      // Register the user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile with default 'user' role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              role: 'user',
            },
          ]);

        if (profileError) throw profileError;
        
        setFormStatus('success');
        
        // If email confirmation is required
        if (authData.user.identities?.length === 0) {
          router.push('/signup/confirmation');
        } else {
          // If no email confirmation needed, redirect to order page
          router.push('/order');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during sign up');
      setFormStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-DEFAULT flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="heading-2">Create an Account</h1>
            <p className="mt-4 paragraph">
              Join Art Coffee to order, earn rewards, and unlock exclusive benefits.
            </p>
          </div>

          <div className="card mt-8">
            <form className="space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="p-3 bg-error/10 border border-error/30 rounded text-error text-sm">
                  {error}
                </div>
              )}

              {formStatus === 'success' && (
                <div className="p-3 bg-success/10 border border-success/30 rounded text-success text-sm">
                  Account created successfully! Redirecting...
                </div>
              )}

              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-text-light">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  {formStatus === 'loading' ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {formStatus === 'loading' ? 'Creating Account...' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-4">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary-dark transition-colors font-medium"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-text-light text-xs">
              By signing up, you agree to our{' '}
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