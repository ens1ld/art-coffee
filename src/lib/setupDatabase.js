'use client';
import { supabase } from './supabaseClient';

// Function to apply migration
export async function applyMigration() {
  try {
    // Read the migration SQL
    const response = await fetch('/api/get-migration');
    if (!response.ok) {
      throw new Error('Failed to fetch migration SQL');
    }
    const { sql } = await response.json();
    
    // Execute the SQL using our new API endpoint
    const executionResponse = await fetch('/api/execute-migration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });
    
    if (!executionResponse.ok) {
      const errorData = await executionResponse.json();
      throw new Error(`Migration execution failed: ${errorData.error || executionResponse.statusText}`);
    }
    
    const result = await executionResponse.json();
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error.message || String(error) };
  }
}

// Function to create a test user
export async function createTestUser(email, password, role = 'user') {
  try {
    console.log(`Creating test ${role} user: ${email}`);
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    });
    
    if (error) throw error;
    
    // Force user to be approved if admin/superadmin
    if (role === 'admin' || role === 'superadmin') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', data.user.id);
      
      if (updateError) throw updateError;
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Create test user error:', error);
    return { success: false, error };
  }
}

// Function to create all test users
export async function setupTestUsers() {
  const results = {
    user: await createTestUser('testuser@example.com', 'password123'),
    admin: await createTestUser('testadmin@example.com', 'password123', 'admin'),
    superadmin: await createTestUser('testsuperadmin@example.com', 'password123', 'superadmin')
  };
  
  return results;
}

// Function to check if profiles table exists
export async function checkProfilesTable() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // table does not exist
        return { exists: false, error };
      }
      throw error;
    }
    
    return { exists: true, count: data?.length };
  } catch (error) {
    console.error('Check profiles table error:', error);
    return { exists: false, error };
  }
}

// Function to check if a user with specific email exists
export async function checkUserExists(email) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    const user = data.users.find(u => u.email === email);
    return { exists: !!user, user };
  } catch (error) {
    console.error('Check user exists error:', error);
    // Fallback - try to find by signing in
    try {
      const { data } = await supabase.auth.signInWithPassword({
        email,
        password: 'wrong-password-just-checking'
      });
      // If we don't get an invalid credentials error, the user exists
      return { exists: true };
    } catch (err) {
      // If we get a specific invalid credentials error, the user exists
      if (err.message && err.message.includes('Invalid credentials')) {
        return { exists: true };
      }
      return { exists: false, error };
    }
  }
} 