// Add console logs to help debug any Supabase connection issues
console.log('Initializing Supabase client');
console.log('Environment variables present:', {
  urlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Import the core Supabase client instead of the SSR version
import { createClient } from '@supabase/supabase-js';

// Fix the hardcoded values to ensure they're complete and correct
const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo'

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Anon Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

// Create and export the Supabase client using the direct approach
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Test the connection immediately 
(async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    // Simple health check query
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful!', data);
    }
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
  }
})();

// Helper function to check if a user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper function to get user role
export async function getUserRole() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    return profile?.role || null
  } catch (error) {
    console.error('Get role error:', error)
    return null
  }
}

// Helper function to create test user for debug purposes
export async function createTestUser(email, password, role) {
  try {
    console.log('Creating test user with credentials:', { email, role });
    
    // First, try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Error creating test user:', signUpError);
      return { error: signUpError };
    }

    // If successful, create or update the profile
    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: signUpData.user.id,
            email,
            role,
            approved: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { error: profileError };
      }

      return { success: true, user: signUpData.user };
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error };
  }
}
