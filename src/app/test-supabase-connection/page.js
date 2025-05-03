'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { testConnection } from '@/lib/testSupabaseConnection';

export default function TestSupabaseConnectionPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runTests() {
      try {
        // Call our direct test API
        const directResponse = await fetch('/api/direct-test');
        const directData = await directResponse.json();
        
        // Call our signup test API
        const signupResponse = await fetch('/api/signup-test');
        const signupData = await signupResponse.json();
        
        // Run the client-side tests
        const connectionTests = await testConnection();

        setResults({
          directTest: directData,
          signupTest: signupData,
          connectionTests
        });
      } catch (err) {
        console.error('Test error:', err);
        setError(err.message || 'Unknown error occurred during tests');
      } finally {
        setLoading(false);
      }
    }

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Supabase Connection Test</h1>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6">
            <p className="font-medium">Test Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-lg font-medium text-blue-800 mb-4">Client-Side Connection Tests</h2>
              <div className="mb-4">
                {results?.connectionTests?.tests.map((test, index) => (
                  <div 
                    key={index} 
                    className={`p-3 mb-2 rounded-lg ${test.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${test.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <p className="font-medium">{test.name}: {test.success ? 'Success' : 'Failed'}</p>
                    </div>
                    {test.message && <p className="text-sm ml-5 mt-1 text-gray-600">{test.message}</p>}
                    {test.error && <p className="text-sm ml-5 mt-1 text-red-600">Error: {test.error}</p>}
                    {test.data && (
                      <div className="ml-5 mt-1">
                        <pre className="text-xs bg-white p-2 rounded border border-gray-200 mt-1">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-lg font-medium text-green-800 mb-4">Direct Signup Test Results</h2>
              <pre className="bg-white p-4 rounded overflow-auto text-xs max-h-96">
                {JSON.stringify(results?.signupTest, null, 2)}
              </pre>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-lg font-medium text-blue-800 mb-4">Direct API Test Results</h2>
              <pre className="bg-white p-4 rounded overflow-auto text-xs max-h-96">
                {JSON.stringify(results?.directTest, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-amber-800 font-medium mb-2">Troubleshooting Supabase</p>
          <p className="text-sm text-amber-700 mb-4">
            If all tests fail, the Supabase project might be paused or the API key might be incorrect.
            You might need to check the Supabase dashboard and ensure the project is active.
          </p>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 transition-colors"
          >
            Return to Home
          </Link>
          <Link 
            href="/login-manual"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go to Manual Login
          </Link>
        </div>
      </div>
    </div>
  );
} 