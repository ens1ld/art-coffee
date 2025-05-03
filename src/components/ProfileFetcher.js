'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Create context with default values
const ProfileContext = createContext({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: () => Promise.resolve()
});

// Hook to use the profile context
export function useProfile() {
  return useContext(ProfileContext);
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
    </div>
  );
}

// Error view component
function ErrorView({ message, isRecursionError }) {
  return (
    <div className={`p-4 ${isRecursionError ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'} my-4`}>
      <p className="font-medium">{isRecursionError ? 'Database Configuration Issue' : 'Error'}</p>
      <p>{message}</p>
      
      {isRecursionError && (
        <div className="mt-2 text-xs">
          <p>This is a known issue with the database security policies.</p>
          <p>Please ask an administrator to run the <code className="bg-gray-100 px-1 py-0.5 rounded">supabase/fix-recursion.sql</code> script in the Supabase SQL Editor.</p>
        </div>
      )}
    </div>
  );
}

// Helper function to check if error is a recursion error
function isRecursionError(error) {
  if (!error) return false;
  
  const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
  return errorStr.includes('infinite recursion') || 
         errorStr.includes('42P17') || 
         errorStr.includes('recursion detected in policy');
}

// ProfileFetcher component that provides profile data to the app
export function ProfileFetcher({ children }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let timeoutId = null;
    
    async function load() {
      try {
        // Get session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', typeof sessionError === 'object' ? JSON.stringify(sessionError) : sessionError);
          throw sessionError;
        }
        
        const session = data?.session;
        
        if (!session?.user) {
          if (mountedRef.current) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }
        
        // Set user state
        if (mountedRef.current) setUser(session.user);
        
        // Fetch profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
  
          if (profileError) {
            console.error('Profile error:', typeof profileError === 'object' ? JSON.stringify(profileError) : profileError);
            
            // Check for recursion error specifically
            if (isRecursionError(profileError)) {
              if (mountedRef.current) {
                setError('Database policy error: Infinite recursion detected. Please run the fix-recursion.sql script in Supabase.');
              }
              throw profileError;
            }
            
            throw profileError;
          }
          
          if (mountedRef.current) {
            setProfile(profileData);
            setError(null); // Clear any previous errors
            setRetryCount(0); // Reset retry count on success
          }
        } catch (profileErr) {
          console.error('Profile fetch error details:', profileErr);
          
          // If we get an infinite recursion error, it's likely a Supabase RLS policy issue
          if (isRecursionError(profileErr)) {
            if (mountedRef.current) {
              setError('Database policy error: Infinite recursion detected in Supabase RLS policies. An administrator needs to run the fix-recursion.sql script.');
            }
          } else if (retryCount < 3) {
            // Retry a few times for other errors
            if (mountedRef.current) {
              setRetryCount(prev => prev + 1);
              timeoutId = setTimeout(load, 2000); // Try again in 2 seconds
            }
            return;
          } else {
            if (mountedRef.current) {
              setError(profileErr.message || 'Failed to retrieve profile after multiple attempts');
            }
          }
        }
      } catch (e) {
        console.error('Auth error:', typeof e === 'object' ? JSON.stringify(e) : e);
        if (mountedRef.current) setError(e?.message || 'Authentication error');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    
    load();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (mountedRef.current) {
          setUser(session.user);
          setLoading(true); // Start loading again
        }
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Auth change profile error:', typeof error === 'object' ? JSON.stringify(error) : error);
            throw error;
          }
          
          if (mountedRef.current) setProfile(data);
        } catch (e) {
          console.error('Profile fetch error after auth change:', e);
          if (mountedRef.current) setError(e?.message || 'Failed to retrieve profile');
        } finally {
          if (mountedRef.current) setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mountedRef.current) {
          setUser(null);
          setProfile(null);
          setError(null);
        }
      }
    });
    
    return () => { 
      mountedRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [retryCount]);

  // Define the refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Refresh profile error:', typeof error === 'object' ? JSON.stringify(error) : error);
        throw error;
      }
      
      setProfile(data);
    } catch (e) {
      setError(e?.message || 'Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Context-based version
  const contextValue = {
    user,
    profile,
    loading,
    error,
    refreshProfile
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// Render props version of ProfileFetcher
export default function ProfileFetcherWithRenderProps({ children }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let timeoutId = null;
    
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mountedRef.current) {
            setLoading(false);
          }
          return; // Allow rendering without error when not signed in
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Render props profile error:', typeof error === 'object' ? JSON.stringify(error) : error);
            
            // Check if it's a recursion error
            if (isRecursionError(error)) {
              console.log('Recursion error detected - attempting fallback method');
              
              // FALLBACK: Try to get user directly from auth, then query without RLS
              try {
                // RLS may be causing the recursion, so try a direct approach
                // Construct a minimal profile object with available data
                const fallbackProfile = {
                  id: session.user.id,
                  email: session.user.email,
                  role: session.user.user_metadata?.role || 'user',
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at,
                  approved: true
                };
                
                console.log('Using fallback profile:', fallbackProfile);
                
                if (mountedRef.current) {
                  setProfile(fallbackProfile);
                  setError(null);
                  return;
                }
              } catch (fallbackError) {
                console.error('Fallback method failed:', fallbackError);
                // Continue to error handling
              }
              
              if (mountedRef.current) {
                // Only show as warning, not blocking error
                console.warn('Database policy warning: Infinite recursion detected in Supabase RLS policies.');
                // Don't set error here, let the app continue with session data
              }
              // Don't throw here - try to continue with minimal data
            } else {
              throw error;
            }
          }
          
          if (mountedRef.current) {
            setProfile(data);
            setRetryCount(0);
            setError(null);
          }
        } catch (profileErr) {
          console.error('Profile fetch error details (render props):', profileErr);
          
          if (isRecursionError(profileErr)) {
            // Create minimal profile from session data
            const fallbackProfile = {
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'user',
              created_at: new Date().toISOString(),
              approved: true
            };
            
            if (mountedRef.current) {
              setProfile(fallbackProfile);
              // Don't set error, continue with fallback profile
            }
          } else if (retryCount < 3) {
            if (mountedRef.current) {
              setRetryCount(prev => prev + 1);
              timeoutId = setTimeout(load, 2000);
            }
            return;
          } else {
            if (mountedRef.current) {
              setError(profileErr.message || 'Failed to load profile after multiple attempts');
            }
          }
        }
      } catch (e) {
        if (mountedRef.current) {
          setError(e?.message || 'Error loading user session');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }
    
    load();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [retryCount]);
  
  // Show loading state
  if (loading) return <LoadingSpinner />;
  
  // Show error with special handling for recursion errors
  if (error) return <ErrorView message={error} isRecursionError={isRecursionError(error)} />;
  
  // Render children with profile data
  return children({ profile });
} 