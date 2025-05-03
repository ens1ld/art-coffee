import { NextResponse } from 'next/server';

// Directly test if the Supabase project is reachable
export async function GET() {
  const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';
  
  try {
    // First test: Just try to reach the project health endpoint without authentication
    const healthResponse = await fetch(`${supabaseUrl}/`);
    const projectExists = healthResponse.status !== 404;
    
    // Try with authentication
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/`, {
      headers: {
        'apikey': supabaseKey
      }
    });
    
    return NextResponse.json({
      projectExists,
      healthStatus: healthResponse.status,
      authStatus: authResponse.status,
      url: supabaseUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      networkError: true,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 