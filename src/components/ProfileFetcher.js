'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Create context with default values
const ProfileContext = createContext({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: () => Promise.resolve(),
  isAdmin: false,
  isSuperadmin: false,
  signOut: () => Promise.resolve(),
  favorites: [],
  setFavorites: () => {}
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

// Improved helper functions for role checking
function isAdmin(role) {
  return role === 'admin' || role === 'superadmin';
}

function isSuperadmin(role) {
  return role === 'superadmin';
}

// ProfileFetcher component that provides profile data to the app
export function ProfileFetcher({ children }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const mountedRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Track session in state to prevent unnecessary re-fetches
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Cache the profile data in localStorage to reduce loading flicker
  useEffect(() => {
    try {
      // Only cache if we have valid data
      if (user && profile) {
        const cacheData = {
          user,
          profile,
          timestamp: Date.now()
        };
        localStorage.setItem('art-coffee-profile-cache', JSON.stringify(cacheData));
      }
    } catch (e) {
      console.error('Error caching profile data:', e);
      // Non-critical error, don't need to set state
    }
  }, [user, profile]);

  // Try to load cached data on initial mount for faster rendering
  useEffect(() => {
    try {
      const cachedDataStr = localStorage.getItem('art-coffee-profile-cache');
      if (cachedDataStr) {
        const cachedData = JSON.parse(cachedDataStr);
        const cacheAge = Date.now() - cachedData.timestamp;
        
        // Only use cache if it's less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000 && cachedData.user && cachedData.profile) {
          setUser(cachedData.user);
          setProfile(cachedData.profile);
          // Still keep loading true until we verify with server
        }
      }
    } catch (e) {
      console.error('Error loading cached profile data:', e);
      // Non-critical error, continue with normal loading
    }
  }, []);

  // Main data fetching function
  const fetchProfileData = useCallback(async (currentSession) => {
    if (!currentSession?.user) return false;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        
        // Check for common RLS policy errors
        if (profileError.code === '42501') {
          return { error: 'Permission denied: unable to access profile due to security policy' };
        }

        // Special handling for profile not found
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, attempting to create it...');
          
          // Try to create a profile using user metadata
          const role = currentSession.user.user_metadata?.role || 'user';
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: currentSession.user.id,
              email: currentSession.user.email,
              role: role,
              approved: role !== 'admin', // Admin needs approval
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            return { error: 'Failed to create profile. Please contact support.' };
          }
          
          // Retry fetching the profile after creating it
          const { data: newProfile, error: refetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (refetchError) {
            return { error: 'Created profile but failed to fetch it' };
          }
          
          return { profile: newProfile };
        }
        
        return { error: profileError.message || 'Failed to fetch profile' };
      }
      
      return { profile: profileData };
    } catch (e) {
      console.error('Unexpected profile fetch error:', e);
      return { error: e.message || 'An unexpected error occurred' };
    }
  }, []);

  // Load user session and profile
  useEffect(() => {
    let timeoutId = null;
    
    async function loadUserAndProfile() {
      try {
        setLoading(true);
        
        // Get session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        const currentSession = data?.session;
        setSession(currentSession);
        sessionRef.current = currentSession;
        
        if (!currentSession?.user) {
          if (mountedRef.current) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            setError(null);
          }
          return;
        }
        
        // Set user state immediately
        if (mountedRef.current) {
          setUser(currentSession.user);
        }
        
        // Fetch profile data
        const result = await fetchProfileData(currentSession);
        
        if (mountedRef.current) {
          if (result.error) {
            setError(result.error);
            
            // Retry a few times for recoverable errors
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              timeoutId = setTimeout(loadUserAndProfile, 2000);
              return;
            }
          } else if (result.profile) {
            setProfile(result.profile);
            setError(null);
            setRetryCount(0);
          }
          
          setLoading(false);
        }
      } catch (e) {
        console.error('Auth error:', e);
        if (mountedRef.current) {
          setError(e?.message || 'Authentication error');
          setLoading(false);
        }
      }
    }

    // Initial load
    loadUserAndProfile();
    
    // Set up auth change listener with improved handling
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change:', event, newSession ? 'Session exists' : 'No session');
      
      // Force immediate UI update for all auth events
      if (newSession?.user) {
        // Update user state immediately for better responsiveness
        setUser(newSession.user);
        // Only set loading true for events that need profile refresh
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          setLoading(true);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear all auth state immediately on sign out
        setUser(null);
        setProfile(null);
        setSession(null);
        sessionRef.current = null;
        
        // Clear local storage cache
        try {
          localStorage.removeItem('art-coffee-profile-cache');
        } catch (e) {
          console.warn('Failed to clear profile cache:', e);
        }
        
        setLoading(false);
        return;
      }
      
      // Update session reference
      setSession(newSession);
      sessionRef.current = newSession;
      
      // For sign-in event or session changes, always fetch fresh profile
      if (newSession?.user && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        try {
          const result = await fetchProfileData(newSession);
          if (mountedRef.current) {
            if (result.error) {
              setError(result.error);
            } else if (result.profile) {
              setProfile(result.profile);
              setError(null);
            }
          }
        } catch (e) {
          console.error('Error fetching profile on auth change:', e);
          if (mountedRef.current) {
            setError(e?.message || 'Failed to fetch profile after authentication change');
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      }
    });
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchProfileData, retryCount]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // The auth listener will handle state updates
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error.message || 'Failed to sign out' };
    }
  }, []);

  // Define the refresh profile function with optimistic updates
  const refreshProfile = useCallback(async (updates = null) => {
    if (!user) return { error: 'Not authenticated' };
    
    try {
      setLoading(true);
      
      // If updates are provided, update the profile first
      if (updates) {
        // Create a merged profile for optimistic updates
        const optimisticProfile = { ...profile, ...updates };
        setProfile(optimisticProfile);
        
        // Only allow updating certain fields
        const safeUpdates = { 
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        // Don't allow changing role or approved status directly
        delete safeUpdates.role;
        delete safeUpdates.approved;
        delete safeUpdates.id;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(safeUpdates)
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Profile update error:', updateError);
          // Revert optimistic update on error
          const { data, error: refetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!refetchError && data) {
            setProfile(data);
          }
          
          setLoading(false);
          return { error: updateError.message || 'Failed to update profile' };
        }
      }
      
      // Fetch the latest profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Refresh profile error:', error);
        setLoading(false);
        return { error: error.message || 'Failed to refresh profile' };
      }
      
      setProfile(data);
      setLoading(false);
      return { profile: data };
    } catch (e) {
      console.error('Unexpected refresh error:', e);
      setLoading(false);
      return { error: e.message || 'An unexpected error occurred' };
    }
  }, [user, profile]);

  // Context value with computed properties
  const contextValue = {
    user,
    profile,
    loading,
    error,
    refreshProfile,
    isAdmin: profile ? isAdmin(profile.role) : false,
    isSuperadmin: profile ? isSuperadmin(profile.role) : false,
    signOut,
    favorites,
    setFavorites
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// Export the default component
export default ProfileFetcher; 