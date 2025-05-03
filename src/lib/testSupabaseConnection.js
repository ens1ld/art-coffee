// Simple test utility for Supabase connection
import { createClient } from '@supabase/supabase-js';

export async function testConnection() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  try {
    // Hardcoded credentials
    const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';
    
    // Test 1: Create client
    let client;
    try {
      client = createClient(supabaseUrl, supabaseKey);
      results.tests.push({
        name: 'Create client',
        success: true,
        message: 'Successfully created Supabase client'
      });
    } catch (err) {
      results.tests.push({
        name: 'Create client',
        success: false,
        error: err.message
      });
      return results; // Stop if we can't even create the client
    }
    
    // Test 2: Auth version check
    try {
      const { data, error } = await client.auth.getSession();
      results.tests.push({
        name: 'Auth check',
        success: !error,
        data: data ? { sessionExists: !!data.session } : null,
        error: error ? error.message : null
      });
    } catch (err) {
      results.tests.push({
        name: 'Auth check',
        success: false,
        error: err.message
      });
    }
    
    // Test 3: Database query
    try {
      const { data, error } = await client.from('profiles').select('count');
      results.tests.push({
        name: 'Database query',
        success: !error,
        data: data || null,
        error: error ? error.message : null
      });
    } catch (err) {
      results.tests.push({
        name: 'Database query',
        success: false,
        error: err.message
      });
    }
    
    // Test 4: Check anon key
    results.tests.push({
      name: 'Anon key check',
      success: true,
      data: {
        keyLength: supabaseKey.length,
        keyStart: supabaseKey.substring(0, 10) + '...',
        keyEnd: '...' + supabaseKey.substring(supabaseKey.length - 10)
      }
    });
    
    return results;
  } catch (err) {
    results.tests.push({
      name: 'Overall execution',
      success: false,
      error: err.message
    });
    return results;
  }
} 