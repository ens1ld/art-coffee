'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Create context
const ProfileContext = createContext(null);

// Hook to use the profile context
export function useProfile() {
  return useContext(ProfileContext);
}

// ProfileFetcher component that provides profile data to the app
export default function ProfileFetcher({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Function to fetch a user's profile - simplified for reliability
  const fetchProfile = useCallback(async (userId) => {
    try {
      console.log(`Fetching profile for user: ${userId}`);
      
      // Try list query first (more reliable than single())
      const { data: profiles, error: listError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
      
      if (!listError && profiles && profiles.length > 0) {
        console.log('Profile found via list query:', profiles[0]);
        return profiles[0];
      }
      
      if (listError) {
        console.error('Error fetching profile list:', listError);
      } else {
        console.log('No profile found via list query, will attempt to create');
      }
      
      // If we reach here, no profile was found
      // Try using single query as a backup
      const { data: singleProfile, error: singleError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!singleError && singleProfile) {
        console.log('Profile found via single query:', singleProfile);
        return singleProfile;
      }
      
      if (singleError) {
        console.log('Error in single profile query:', singleError);
      }
      
      // Create a new profile as a fallback
      console.log('Creating new profile as fallback');
      
      // Get user data first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error('No user data available for profile creation');
        throw new Error('User data unavailable');
      }
      
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: userData.user.email,
          role: userData.user.user_metadata?.role || 'user',
          approved: userData.user.user_metadata?.role !== 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*');
      
      if (createError) {
        console.error('Failed to create profile:', createError);
        throw createError;
      }
      
      if (newProfile && newProfile.length > 0) {
        console.log('Created new profile successfully:', newProfile[0]);
        return newProfile[0];
      } else {
        // Try one more time to fetch the profile in case it was created by a trigger
        console.log('Profile insert returned no data, trying one final fetch');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to allow for DB updates
        
        const { data: finalProfile, error: finalError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!finalError && finalProfile) {
          console.log('Profile found on final attempt:', finalProfile);
          return finalProfile;
        }
        
        throw new Error('Could not create or retrieve profile');
      }
    } catch (err) {
      console.error('Profile fetch/create failed:', err);
      throw err;
    }
  }, []);

  // Refetch user and profile data
  const refreshUserAndProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refreshing user session and profile');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setProfile(null);
        setError('Authentication error');
        return;
      }
      
      if (!session) {
        console.log('No active session');
        setUser(null);
        setProfile(null);
        return;
      }
      
      setUser(session.user);
      console.log('User set:', session.user.email);
      
      try {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        console.log('Profile set:', profileData);
      } catch (profileError) {
        console.error('Profile error:', profileError);
        setError('Could not retrieve profile');
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Initial data fetch and auth subscription
  useEffect(() => {
    console.log('ProfileFetcher initializing');
    
    // Initial check
    refreshUserAndProfile();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setUser(session.user);
          console.log('User signed in:', session.user.email);
          
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            console.log('Profile set after sign in:', profileData);
            
            // Get redirect destination from URL if any
            const url = new URL(window.location.href);
            const redirectTo = url.searchParams.get('redirectTo');
            
            // Redirect based on destination or role
            if (redirectTo) {
              console.log('Redirecting to:', redirectTo);
              router.push(redirectTo);
            } else if (profileData.role === 'admin' && profileData.approved) {
              console.log('Redirecting to admin');
              router.push('/admin');
            } else if (profileData.role === 'superadmin') {
              console.log('Redirecting to superadmin');
              router.push('/superadmin');
            } else {
              console.log('Redirecting to profile');
              router.push('/profile');
            }
          } catch (error) {
            console.error('Error setting profile after auth change:', error);
            // Even on error, try to redirect to profile
            router.push('/profile');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setProfile(null);
        router.push('/');
      }
    });
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchProfile, refreshUserAndProfile, router]);

  // Provide context
  const value = {
    user,
    profile,
    loading,
    error,
    refreshUserAndProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
} 