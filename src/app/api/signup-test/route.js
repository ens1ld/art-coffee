import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hard-code the credentials directly
    const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';
    
    console.log('Testing signup with fetch API');
    
    // Generate unique test email
    const testEmail = `signuptest-${Date.now()}@example.com`;
    const testPassword = '123456';
    
    // Use native fetch to call Supabase API directly
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    // Get response data
    const status = response.status;
    let data;
    let responseText;
    
    try {
      data = await response.json();
    } catch (err) {
      responseText = await response.text();
    }
    
    return NextResponse.json({
      success: status >= 200 && status < 300,
      status,
      data,
      responseText,
      request: {
        url: `${supabaseUrl}/auth/v1/signup`,
        method: 'POST',
        headers: {
          'apikey': `${supabaseKey.substring(0, 10)}...`,
          'Content-Type': 'application/json',
        },
        body: {
          email: testEmail,
          password: testPassword.substring(0, 1) + '...',
        },
      }
    });
  } catch (error) {
    console.error('Signup test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
} 