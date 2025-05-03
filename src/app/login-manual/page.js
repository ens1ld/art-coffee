'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, createTestUser } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function LoginManualPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserRole, setNewUserRole] = useState('user');
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('idle');
  const [isClient, setIsClient] = useState(false);
  
  // Use effect to mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const testEmail = 'test-user@artcoffee.com';
  const testPassword = 'test123456';

  // Only fetch data on the client side
  useEffect(() => {
    // Don't run on server
    if (!isClient) return;
    
    // Any initialization code here
    console.log('Initializing manual login page on client-side');
  }, [isClient]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebug({});

    try {
      // Log attempt details
      console.log('Attempting login with:', { email });
      
      // Call Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setDebug({ authError });
        throw authError;
      }

      // Log successful login details
      console.log('Login successful:', data);
      setDebug({ success: true, data });

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        setDebug(prev => ({ ...prev, profileError }));
        
        // Try to create a profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: 'user',
              approved: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          
        if (insertError) {
          console.error('Profile creation error:', insertError);
          setDebug(prev => ({ ...prev, insertError }));
        } else {
          console.log('Created new profile for user');
          setDebug(prev => ({ ...prev, profileCreated: true }));
        }
      } else {
        console.log('Profile data:', profile);
        setDebug(prev => ({ ...prev, profile }));
        
        // Redirect based on role or fallback to home
        if (profile?.role === 'superadmin') {
          router.push('/superadmin');
        } else if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      setDebug(prev => ({ ...prev, error }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTestUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebug({});
    
    try {
      console.log('Creating test user:', { email, password, role: newUserRole });
      
      const result = await createTestUser(email, password, newUserRole);
      
      if (result.error) {
        throw result.error;
      }
      
      setDebug({ createUserSuccess: true, user: result.user });
      setError('');
      alert(`Test user created successfully. Email: ${email}, Role: ${newUserRole}`);
    } catch (error) {
      console.error('Create user error:', error);
      setError('Failed to create test user: ' + (error.message || 'Unknown error'));
      setDebug({ createUserError: error });
    } finally {
      setLoading(false);
    }
  };

  // New function for quick test user creation
  const createSimpleTestUser = async (role) => {
    setLoading(true);
    setError('');
    setDebug({});
    
    // Use very simple credentials
    const testEmail = `test${role}@example.com`;
    const testPassword = '123456';
    
    try {
      console.log('Creating simple test user:', { email: testEmail, role });
      
      // Log API key for debugging
      console.log('Using anon key (first 10 chars):', supabase.supabaseKey.substring(0, 10) + '...');
      
      // First, try a direct API call to check connectivity
      const { error: pingError } = await supabase.from('profiles').select('count').limit(1);
      if (pingError) {
        console.error('Database connectivity test failed:', pingError);
        setDebug(prev => ({ ...prev, pingError }));
      } else {
        console.log('Database connectivity test successful');
      }
      
      const result = await createTestUser(testEmail, testPassword, role);
      
      if (result.error) {
        throw result.error;
      }
      
      setDebug({ createUserSuccess: true, user: result.user, email: testEmail, password: testPassword });
      setEmail(testEmail);
      setPassword(testPassword);
      
      alert(`Test ${role} created successfully!\nEmail: ${testEmail}\nPassword: ${testPassword}\nYou can now log in with these credentials.`);
    } catch (error) {
      console.error('Quick create test user error:', error);
      setError('Failed to create test user: ' + (error.message || 'Unknown error'));
      setDebug({ createUserError: error, apiKey: supabase.supabaseKey ? 'Present' : 'Missing' });
    } finally {
      setLoading(false);
    }
  };

  async function handleTestLogin() {
    setLoading(true);
    setMessage(null);
    setError(null);
    setStatus('logging-in');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) {
        setError(`Login error: ${error.message}`);
        setStatus('error');
      } else {
        setMessage('Login successful! User: ' + JSON.stringify(data.user));
        setStatus('success');
      }
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  // If we're not on the client, show a loading state
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
            <h1 className="text-3xl font-bold">Manual Test Login</h1>
            <p className="mt-4 text-gray-600">
              Use this page for direct login testing
            </p>
            
            <div className="mt-4">
              <button 
                onClick={() => setShowCreateUser(!showCreateUser)}
                className="text-amber-700 text-sm underline"
              >
                {showCreateUser ? 'Hide User Creation' : 'Show User Creation Form'}
              </button>
            </div>
          </div>

          {/* Quick test user creation buttons */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">One-Click Test Users</h3>
            <p className="text-sm text-blue-600 mb-3">Create test users with simple passwords (123456)</p>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => createSimpleTestUser('user')}
                disabled={loading}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => createSimpleTestUser('admin')}
                disabled={loading}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm transition-colors"
              >
                Create Admin
              </button>
              <button
                type="button"
                onClick={() => createSimpleTestUser('superadmin')}
                disabled={loading} 
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-sm transition-colors"
              >
                Create Superadmin
              </button>
            </div>
          </div>

          {showCreateUser && (
            <div className="bg-amber-50 p-8 rounded-lg shadow-md mt-8 border border-amber-200">
              <h2 className="text-xl font-bold mb-4">Create Test User</h2>
              <form className="space-y-6" onSubmit={handleCreateTestUser}>
                <div>
                  <label htmlFor="create-email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="create-email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="create-password" className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="create-password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="create-role" className="block text-gray-700 font-medium mb-2">
                    Role
                  </label>
                  <select
                    id="create-role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    disabled={loading}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-amber-700 text-white py-2 px-4 rounded hover:bg-amber-600 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  Create Test User
                </button>
              </form>
            </div>
          )}

          <div className="bg-white p-8 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  {error}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full bg-amber-800 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors flex justify-center items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing Login...
                    </>
                  ) : (
                    'Test Login'
                  )}
                </button>
              </div>
            </form>
          </div>

          {Object.keys(debug).length > 0 && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg overflow-auto">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Try creating a test user with the form above, or use:
            </p>
            <div className="mt-2 text-xs text-left bg-gray-50 p-3 rounded">
              <p><strong>Simple Password:</strong> 123456</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">One-Click Test Users</h3>
            <p className="text-sm text-blue-600 mb-4">
              Create a test user with one click to verify Supabase connectivity.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleTestLogin()}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading && status === 'logging-in' ? 'Logging in...' : 'Login With Test User'}
              </button>
            </div>
          </div>

          {message && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p>{message}</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-gray-800 mb-2 font-medium">Test Credentials</h2>
            <div className="bg-white p-3 rounded border border-gray-200 mb-2">
              <p><span className="font-medium">Email:</span> {testEmail}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p><span className="font-medium">Password:</span> {testPassword}</p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Link
              href="/test-supabase-connection"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Run Supabase Connection Tests
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 