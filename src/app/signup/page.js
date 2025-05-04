'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Validation functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateName = (name) => {
  return name.trim().length >= 2;
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [requestAdminRole, setRequestAdminRole] = useState(false);
  const [formTouched, setFormTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formStatus, setFormStatus] = useState('');
  
  // Check if user is already logged in
  useEffect(() => {
    async function checkAuthStatus() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // User is already logged in, redirect to home
        router.push('/');
      }
    }
    
    checkAuthStatus();
  }, [router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;
    
    // Validate name
    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (!validateName(formData.name)) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setFormStatus('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setFormStatus('loading');

    try {
      // Determine the user role
      const role = requestAdminRole ? 'admin' : 'user';
      const approved = role === 'user'; // Admin needs approval
      
      // Register the user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile with proper role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              role: role,
              approved: approved,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If we can't create the profile, warn but continue
          // The profile will be created by the trigger if available
        }
        
        setFormStatus('success');
        
        if (requestAdminRole) {
          // Show admin request message
          setFormStatus('admin-requested');
          // Redirect to pending approval page after 3 seconds
          setTimeout(() => {
            router.push('/pending-approval');
          }, 3000);
        } else {
          // Check if email verification is required
          if (authData.user.identities?.length === 0 || authData.session === null) {
            router.push('/signup/confirmation');
          } else {
            // If no email confirmation needed, redirect to order page
            router.push('/order');
          }
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (error.message.includes('rate limit')) {
        setError('Too many signup attempts. Please try again later.');
      } else {
        setError(error.message || 'An error occurred during sign up. Please try again.');
      }
      
      setFormStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-900">Create an Account</h1>
            <p className="mt-4 text-gray-600">
              Join Art Coffee to order, earn rewards, and unlock exclusive benefits.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md mt-8">
            <form className="space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              {formStatus === 'success' && (
                <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
                  Account created successfully! Redirecting...
                </div>
              )}
              
              {formStatus === 'admin-requested' && (
                <div className="p-3 bg-amber-100 border border-amber-300 rounded text-amber-700 text-sm">
                  Admin account requested! It will need approval before you can access admin features.
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full px-3 py-2 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>

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
                  className={`w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full px-3 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                {fieldErrors.password ? (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full px-3 py-2 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={requestAdminRole}
                    onChange={() => setRequestAdminRole(!requestAdminRole)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Request admin access (requires approval)
                  </span>
                </label>
                
                {requestAdminRole && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                    Note: Admin accounts require approval from a superadmin before they can access admin features.
                  </div>
                )}
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
                      Creating Account...
                    </span>
                  ) : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-amber-800 hover:text-amber-700 transition-colors font-medium"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-amber-800 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-amber-800 hover:underline">
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