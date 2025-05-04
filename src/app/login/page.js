'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Create a separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFormStatus('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setFormStatus('loading');

    try {
      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      setFormStatus('success');
      
      // Fetch user profile to get role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', data.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }
      
      // Redirect based on role
      if (profileData) {
        const { role, approved } = profileData;
        
        // If admin but not approved, redirect to pending page
        if (role === 'admin' && !approved) {
          router.push('/pending-approval');
          return;
        }
        
        // Redirect based on role
        if (role === 'superadmin') {
          router.push('/superadmin');
        } else if (role === 'admin') {
          router.push('/admin');
        } else {
          // If there's a redirect specified in URL params, use that
          router.push(redirectTo);
        }
      } else {
        // If no profile or can't determine role, go to default redirect
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      setFormStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-900">Sign In</h1>
          <p className="mt-4 text-gray-600">
            Welcome back to Art Coffee
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md mt-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {formStatus === 'success' && (
              <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
                Login successful! Redirecting...
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-amber-800 hover:text-amber-700 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full py-3 px-4 bg-amber-800 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {formStatus === 'loading' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-amber-800 hover:text-amber-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <Footer />
    </div>
  );
} 