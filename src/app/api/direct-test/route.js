import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';
    
    // Test direct fetch to Supabase REST API
    const healthCheckResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
      },
    });
    
    const healthCheckStatus = healthCheckResponse.status;
    let healthCheckResult;
    try {
      healthCheckResult = await healthCheckResponse.text();
    } catch (err) {
      healthCheckResult = `Error reading response: ${err.message}`;
    }
    
    // Try simple auth endpoint check
    const versionResponse = await fetch(`${supabaseUrl}/auth/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
      },
    });
    
    const versionStatus = versionResponse.status;
    let versionResult;
    try {
      versionResult = await versionResponse.text();
      // Only try to parse as JSON if it looks like JSON
      if (versionResult.startsWith('{') || versionResult.startsWith('[')) {
        versionResult = JSON.parse(versionResult);
      }
    } catch (err) {
      versionResult = { error: `Failed to parse: ${err.message}` };
    }
    
    // Try basic signup with fetch
    const testEmail = `direct-test-${Date.now()}@example.com`;
    const testPassword = '123456';
    
    const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const signupStatus = signupResponse.status;
    let signupResult;
    try {
      const signupText = await signupResponse.text();
      signupResult = signupText.startsWith('{') ? JSON.parse(signupText) : { raw: signupText };
    } catch (err) {
      signupResult = { error: `Failed to parse: ${err.message}` };
    }
    
    return NextResponse.json({
      message: 'Direct API test results',
      healthCheck: {
        status: healthCheckStatus,
        result: healthCheckResult,
      },
      version: {
        status: versionStatus,
        result: versionResult,
      },
      signup: {
        status: signupStatus,
        result: signupResult,
      },
      testInfo: {
        email: testEmail,
      }
    });
  } catch (error) {
    console.error('Direct test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
} 