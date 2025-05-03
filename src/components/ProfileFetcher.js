'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Create context for profile data
const ProfileContext = createContext(null);

// Hook to use profile data anywhere in the app
export function useProfile() {
  return useContext(ProfileContext);
}

export default function ProfileFetcher({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Function to fetch user profile
    const getProfile = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setLoading(false);
          return; // No user logged in
        }
        
        // Set the auth user
        setUser(session.user);
        
        // Query the profiles table - not the users table
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          // If profile not found, try to create one
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, attempting to create one...');
            
            // Create a new profile for the user
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: session.user.id, 
                email: session.user.email,
                role: 'user',
                approved: true
              }])
              .select('*')
              .single();
              
            if (insertError) {
              throw insertError;
            }
            
            setProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        getProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <ProfileContext.Provider value={{ profile, user, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
} 