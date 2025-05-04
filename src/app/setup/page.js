'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { applyMigration, createTestUser, checkProfilesTable } from '@/lib/setupDatabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [status, setStatus] = useState('');

  // Function to apply database migration
  const handleApplyMigration = async () => {
    setLoading(true);
    setStatus('Applying migration...');
    try {
      const result = await applyMigration();
      setResults(prev => ({ ...prev, migration: result }));
      setStatus(result.success ? 'Migration applied successfully' : 'Migration failed');
    } catch (error) {
      console.error('Migration error:', error);
      setResults(prev => ({ ...prev, migration: { success: false, error } }));
      setStatus('Migration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to create an admin user
  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminPassword) {
      setStatus('Please enter email and password');
      return;
    }

    setLoading(true);
    setStatus(`Creating admin user: ${adminEmail}...`);
    try {
      const result = await createTestUser(adminEmail, adminPassword, 'admin');
      setResults(prev => ({ ...prev, admin: result }));
      setStatus(result.success ? `Admin created: ${adminEmail}` : 'Admin creation failed');
      
      if (result.success) {
        // Approve the admin user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ approved: true })
          .eq('id', result.user.id);
        
        if (updateError) throw updateError;
        
        setStatus(`Admin created and approved: ${adminEmail}`);
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      setResults(prev => ({ ...prev, admin: { success: false, error } }));
      setStatus('Admin creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a superadmin user
  const handleCreateSuperadmin = async () => {
    if (!adminEmail || !adminPassword) {
      setStatus('Please enter email and password');
      return;
    }

    setLoading(true);
    setStatus(`Creating superadmin user: ${adminEmail}...`);
    try {
      const result = await createTestUser(adminEmail, adminPassword, 'superadmin');
      setResults(prev => ({ ...prev, superadmin: result }));
      setStatus(result.success ? `Superadmin created: ${adminEmail}` : 'Superadmin creation failed');
    } catch (error) {
      console.error('Superadmin creation error:', error);
      setResults(prev => ({ ...prev, superadmin: { success: false, error } }));
      setStatus('Superadmin creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to check profiles table
  const handleCheckProfiles = async () => {
    setLoading(true);
    setStatus('Checking profiles table...');
    try {
      const result = await checkProfilesTable();
      setResults(prev => ({ ...prev, profilesCheck: result }));
      setStatus(result.exists ? 'Profiles table exists' : 'Profiles table does not exist');
    } catch (error) {
      console.error('Check profiles error:', error);
      setResults(prev => ({ ...prev, profilesCheck: { exists: false, error } }));
      setStatus('Check profiles failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-10">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-amber-900">
            Art Coffee Setup
          </h1>

          <div className="bg-amber-50 rounded-lg p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-amber-800">Database Setup</h2>
            
            <div className="space-y-4">
              <div>
                <button 
                  onClick={handleCheckProfiles}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Profiles Table
                </button>
                
                {results.profilesCheck && (
                  <div className={`mt-2 text-sm ${results.profilesCheck.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {results.profilesCheck.exists ? 'Table exists' : 'Table does not exist'}
                    {results.profilesCheck.error && (
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                        {JSON.stringify(results.profilesCheck.error, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <button 
                  onClick={handleApplyMigration}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Database Migration
                </button>
                
                {results.migration && (
                  <div className={`mt-2 text-sm ${results.migration.success ? 'text-green-600' : 'text-red-600'}`}>
                    {results.migration.success ? 'Migration successful' : 'Migration failed'}
                    {results.migration.error && (
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                        {JSON.stringify(results.migration.error, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-amber-800">Create Admin User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input 
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="********"
                  disabled={loading}
                />
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleCreateAdmin}
                  disabled={loading || !adminEmail || !adminPassword}
                  className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Admin
                </button>
                
                <button 
                  onClick={handleCreateSuperadmin}
                  disabled={loading || !adminEmail || !adminPassword}
                  className="px-4 py-2 bg-amber-900 text-white rounded-md hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Superadmin
                </button>
              </div>
              
              {(results.admin || results.superadmin) && (
                <div className="mt-2">
                  {results.admin && (
                    <div className={`text-sm ${results.admin.success ? 'text-green-600' : 'text-red-600'}`}>
                      {results.admin.success ? 'Admin created successfully' : 'Admin creation failed'}
                      {results.admin.error && (
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                          {JSON.stringify(results.admin.error, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  {results.superadmin && (
                    <div className={`text-sm ${results.superadmin.success ? 'text-green-600' : 'text-red-600'}`}>
                      {results.superadmin.success ? 'Superadmin created successfully' : 'Superadmin creation failed'}
                      {results.superadmin.error && (
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                          {JSON.stringify(results.superadmin.error, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {status && (
            <div className="mt-6 p-4 bg-amber-100 border border-amber-300 rounded-md">
              <p className="text-amber-800">{status}</p>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-2 text-amber-800 border border-amber-800 rounded-md hover:bg-amber-50"
            >
              Return to Home
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 