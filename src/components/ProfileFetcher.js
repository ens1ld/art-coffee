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

  // Function to create a profile for a user
  const createProfile = useCallback(async (userId, userEmail) => {
    try {
      console.log('Creating profile for user:', userId);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          role: 'user',
          approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }
      
      console.log('Profile created successfully:', newProfile);
      return newProfile;
    } catch (err) {
      console.error('Failed to create profile:', err);
      throw err;
    }
  }, []);

  // Function to fetch a user's profile
  const fetchProfile = useCallback(async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        // If no profile found, try to create one
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found in fetchProfile, attempting to create one');
          // Get the user email first
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('Error getting user data:', userError);
            throw userError;
          }
          
          if (userData && userData.user) {
            return await createProfile(userId, userData.user.email);
          } else {
            throw new Error('Cannot create profile: User data is missing');
          }
        }
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      console.log('Profile fetched successfully:', profile);
      return profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      throw err;
    }
  }, [createProfile]);

  // Function to refresh user and profile data
  const refreshUserAndProfile = useCallback(async () => {
    try {
      console.log('Refreshing user and profile data');
      setLoading(true);
      setError(null);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in refreshUserAndProfile:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.log('No session found, clearing user and profile');
        setUser(null);
        setProfile(null);
        return;
      }
      
      console.log('Session found, setting user:', session.user.email);
      setUser(session.user);
      
      // Fetch or create profile
      try {
        const profileData = await fetchProfile(session.user.id);
        console.log('Setting profile data:', profileData);
        setProfile(profileData);
      } catch (profileError) {
        console.error('Error in profile handling during refresh:', profileError);
        setError('Failed to retrieve user profile. Please try again.');
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    console.log('ProfileFetcher initialized');
    // Initial data fetch
    refreshUserAndProfile();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          console.log('Setting user in auth state change:', session.user.email);
          setUser(session.user);
          try {
            const profileData = await fetchProfile(session.user.id);
            console.log('Setting profile in auth state change:', profileData);
            setProfile(profileData);
            
            // Redirect to profile page on successful sign-in
            if (event === 'SIGNED_IN') {
              console.log('Redirecting after sign-in based on role:', profileData.role);
              if (profileData.role === 'admin' && profileData.approved) {
                router.push('/admin');
              } else if (profileData.role === 'superadmin') {
                router.push('/superadmin');
              } else {
                router.push('/profile');
              }
            }
          } catch (profileError) {
            console.error('Error fetching profile after auth change:', profileError);
            setError('Failed to retrieve user profile. Please try again.');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing user and profile');
        setUser(null);
        setProfile(null);
      }
    });
    
    return () => {
      console.log('Cleaning up ProfileFetcher');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router, fetchProfile, refreshUserAndProfile]);

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