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
      
      // Try list query first (more reliable than single)
      try {
        console.log('Attempting list query first...');
        const { data: profiles, error: listError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId);
          
        console.log('List query result:', { 
          success: !listError, 
          count: profiles?.length || 0,
          error: listError ? listError.message : null
        });
          
        if (!listError && profiles && profiles.length > 0) {
          console.log('Profile found via list query:', profiles[0]);
          return profiles[0];
        }
      } catch (listErr) {
        console.error('List query failed:', listErr);
      }
      
      // Fall back to single query
      console.log('Falling back to single query...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Single query error:', profileError.message, profileError.code);
        
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
            console.log('Creating profile with data:', {
              id: userId,
              email: userData.user.email,
              role: userData.user.user_metadata?.role || 'user'
            });
            
            // Create new profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email,
                role: userData.user.user_metadata?.role || 'user',
                approved: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('*')
              .single();
              
            if (createError) {
              console.error('Error creating profile:', createError.message, createError.code);
              throw createError;
            }
            
            console.log('Profile created successfully:', newProfile);
            return newProfile;
          } else {
            throw new Error('Cannot create profile: User data is missing');
          }
        }
        
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      console.log('Profile fetched successfully via single query:', profile);
      return profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err.message);
      throw err;
    }
  }, []);

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
        setLoading(false);
        return;
      }
      
      console.log('Session found, setting user:', session.user.email);
      setUser(session.user);
      
      // Fetch or create profile
      try {
        // Try direct query first (bypass single result error)
        const { data: profiles, error: listError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);
          
        console.log('Profile list check result:', { 
          found: profiles?.length > 0, 
          count: profiles?.length || 0,
          error: listError?.message || null
        });
        
        if (listError) {
          console.error('List profiles error:', listError);
          // Continue to fallback methods
        } else if (profiles && profiles.length > 0) {
          // Profile found via list query
          console.log('Profile found via list query:', profiles[0]);
          setProfile(profiles[0]);
          setLoading(false);
          return;
        }
        
        // Try fallback methods
        try {
          const profileData = await fetchProfile(session.user.id);
          console.log('Setting profile data from fetchProfile:', profileData);
          setProfile(profileData);
          setLoading(false);
        } catch (profileError) {
          console.error('Error in profile fetch during refresh:', profileError);
          
          // Last resort: try to create profile manually
          try {
            console.log('Attempting emergency profile creation');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || 'user',
                approved: session.user.user_metadata?.role === 'admin' ? false : true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('*')
              .single();
              
            if (createError) {
              console.error('Emergency profile creation failed:', createError);
              throw new Error(`Failed to create or retrieve profile: ${createError.message}`);
            }
            
            console.log('Emergency profile created:', newProfile);
            setProfile(newProfile);
            setLoading(false);
          } catch (finalError) {
            console.error('All profile retrieval methods failed:', finalError);
            setError('Failed to retrieve user profile. Please contact support.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Critical error in profile handling during refresh:', err);
        setError(`Failed to retrieve user profile: ${err.message}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
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