'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DirectTestPage() {
  const [result, setResult] = useState({ loading: true });
  
  useEffect(() => {
    async function testConnection() {
      try {
        // Create the most minimal Supabase client possible
        const supabaseUrl = 'https://mwitqdkfsrtjiknglgvj.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXRxZGtmc3J0amlrbmdsZ3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzEwMzMsImV4cCI6MjA2MTgwNzAzM30.AVywGy1p7kQxMydlXS8Qa57t1Iotapjleip1beWvPKo';
        
        // Log key details for debugging
        console.log('Key length:', supabaseKey.length);
        console.log('Key start:', supabaseKey.substring(0, 15));
        console.log('Key end:', supabaseKey.substring(supabaseKey.length - 15));
        
        // Step 1: Basic fetch test first (no Supabase client)
        const fetchResult = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          }
        });
        
        const fetchStatus = fetchResult.status;
        const fetchText = await fetchResult.text();
        
        // Step 2: Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Step 3: Test auth session
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        // Step 4: Test simple DB query
        const { data: dbData, error: dbError } = await supabase.from('profiles').select('count');
        
        setResult({
          loading: false,
          timestamp: new Date().toISOString(),
          simpleRequest: {
            status: fetchStatus,
            text: fetchText
          },
          authTest: {
            success: !authError,
            error: authError ? authError.message : null,
            data: authData || null
          },
          dbTest: {
            success: !dbError,
            error: dbError ? dbError.message : null,
            data: dbData || null
          }
        });
      } catch (err) {
        setResult({
          loading: false,
          error: err.message,
          stack: err.stack
        });
      }
    }
    
    testConnection();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Direct Supabase Test</h1>
        
        {result.loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3">Testing connection...</p>
          </div>
        ) : result.error ? (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Error</p>
            <p>{result.error}</p>
            {result.stack && (
              <pre className="mt-2 text-xs bg-red-50 p-2 overflow-auto">
                {result.stack}
              </pre>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-blue-800 mb-2">Simple HTTP Request</h2>
              <p>Status: {result.simpleRequest.status}</p>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto border border-blue-100">
                {result.simpleRequest.text}
              </pre>
            </div>
            
            <div className={`p-4 rounded-lg ${result.authTest.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className="text-lg font-medium mb-2" style={{ color: result.authTest.success ? '#065f46' : '#b91c1c' }}>
                Authentication Test
              </h2>
              <p>Result: {result.authTest.success ? 'Success' : 'Failed'}</p>
              {result.authTest.error && (
                <div className="mt-2 text-red-600">
                  <p>Error: {result.authTest.error}</p>
                </div>
              )}
              {result.authTest.data && (
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto border">
                  {JSON.stringify(result.authTest.data, null, 2)}
                </pre>
              )}
            </div>
            
            <div className={`p-4 rounded-lg ${result.dbTest.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className="text-lg font-medium mb-2" style={{ color: result.dbTest.success ? '#065f46' : '#b91c1c' }}>
                Database Query Test
              </h2>
              <p>Result: {result.dbTest.success ? 'Success' : 'Failed'}</p>
              {result.dbTest.error && (
                <div className="mt-2 text-red-600">
                  <p>Error: {result.dbTest.error}</p>
                </div>
              )}
              {result.dbTest.data && (
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto border">
                  {JSON.stringify(result.dbTest.data, null, 2)}
                </pre>
              )}
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              <p>Test completed at: {result.timestamp}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 