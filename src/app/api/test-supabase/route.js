import { NextResponse } from 'next/server';

export async function GET() {
  // Get Supabase credentials
  const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';

  // Create a test response object
  const results = {
    supabaseUrl,
    keyLength: supabaseKey.length,
    keyStart: supabaseKey.substring(0, 10),
    tests: []
  };

  try {
    // Test 1: Direct HTTP connection to Supabase REST API
    const restApiResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });
    
    const restStatus = restApiResponse.status;
    let restText = '';
    try {
      restText = await restApiResponse.text();
    } catch (e) {
      restText = `Error reading response: ${e.message}`;
    }
    
    results.tests.push({
      name: 'Direct REST API connection',
      success: restStatus >= 200 && restStatus < 300,
      status: restStatus,
      response: restText
    });

    // Test 2: Try auth endpoint
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });
    
    const authStatus = authResponse.status;
    let authText = '';
    try {
      authText = await authResponse.text();
    } catch (e) {
      authText = `Error reading response: ${e.message}`;
    }
    
    results.tests.push({
      name: 'Auth API connection',
      success: authStatus >= 200 && authStatus < 300,
      status: authStatus,
      response: authText
    });

    // Test 3: Try storage endpoint
    const storageResponse = await fetch(`${supabaseUrl}/storage/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });
    
    const storageStatus = storageResponse.status;
    let storageText = '';
    try {
      storageText = await storageResponse.text();
    } catch (e) {
      storageText = `Error reading response: ${e.message}`;
    }
    
    results.tests.push({
      name: 'Storage API connection',
      success: storageStatus >= 200 && storageStatus < 300,
      status: storageStatus,
      response: storageText
    });

    // Return the results
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error',
      results
    }, { status: 500 });
  }
} 