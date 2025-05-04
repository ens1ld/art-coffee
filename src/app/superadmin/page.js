'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SuperAdminPage() {
  const { profile, user, loading, error } = useProfile();
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    pendingAdmins: 0,
    superadmins: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();

  // Check authentication and authorization
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/superadmin');
    } else if (!loading && profile && profile.role !== 'superadmin') {
      router.push('/not-authorized');
    }
  }, [loading, user, profile, router]);

  // Load superadmin dashboard stats
  useEffect(() => {
    if (user && profile && profile.role === 'superadmin') {
      fetchStats();
    }
  }, [user, profile]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      
      // Get counts of different user types
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role, approved');
      
      if (profilesError) throw profilesError;
      
      if (allProfiles) {
        const users = allProfiles.filter(p => p.role === 'user').length;
        const admins = allProfiles.filter(p => p.role === 'admin' && p.approved).length;
        const pendingAdmins = allProfiles.filter(p => p.role === 'admin' && !p.approved).length;
        const superadmins = allProfiles.filter(p => p.role === 'superadmin').length;
        
        setStats({ users, admins, pendingAdmins, superadmins });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full mx-auto"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error || 'Authentication required to access superadmin dashboard'}</p>
            </div>
            <button 
              onClick={() => router.push('/login?redirectTo=/superadmin')}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              Sign In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profile.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Not Authorized</h1>
            <p className="mb-6">You don&apos;t have permission to access the superadmin dashboard.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              Return to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-900">Superadmin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, admins, and system settings</p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-amber-800">Users</h2>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-700">{loadingStats ? '...' : stats.users}</p>
              <p className="text-gray-500 text-sm mt-1">Regular users</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-amber-800">Admins</h2>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-700">{loadingStats ? '...' : stats.admins}</p>
              <p className="text-gray-500 text-sm mt-1">Approved admins</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-amber-800">Pending</h2>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-700">{loadingStats ? '...' : stats.pendingAdmins}</p>
              <p className="text-gray-500 text-sm mt-1">Pending admin approvals</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-amber-800">Superadmins</h2>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-700">{loadingStats ? '...' : stats.superadmins}</p>
              <p className="text-gray-500 text-sm mt-1">Total superadmins</p>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Approve Admins</h3>
                <p className="text-gray-600 mb-4">
                  Review and approve pending admin account requests.
                  {stats.pendingAdmins > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {stats.pendingAdmins} pending
                    </span>
                  )}
                </p>
                <Link 
                  href="/superadmin/approve-admins"
                  className="inline-block px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
                >
                  Manage Approvals
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Manage Users</h3>
                <p className="text-gray-600 mb-4">
                  View, edit, or delete user accounts. Change user roles and permissions.
                </p>
                <Link 
                  href="/superadmin/manage-users"
                  className="inline-block px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
                >
                  Manage Users
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">System Settings</h3>
                <p className="text-gray-600 mb-4">
                  Configure application settings, manage database, and view system logs.
                </p>
                <Link 
                  href="/superadmin/settings"
                  className="inline-block px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
                >
                  System Settings
                </Link>
              </div>
            </div>
          </div>
          
          {/* Database Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Database Management</h2>
            <p className="text-gray-600 mb-6">
              Use these tools to manage and troubleshoot the database and permissions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/setup"
                className="flex items-center justify-center px-4 py-3 bg-amber-50 border border-amber-300 rounded-md text-amber-800 hover:bg-amber-100 transition-colors"
              >
                Database Setup
              </Link>
              
              <Link
                href="/superadmin/database/backup"
                className="flex items-center justify-center px-4 py-3 bg-amber-50 border border-amber-300 rounded-md text-amber-800 hover:bg-amber-100 transition-colors"
              >
                Backup Database
              </Link>
              
              <Link
                href="/superadmin/database/logs"
                className="flex items-center justify-center px-4 py-3 bg-amber-50 border border-amber-300 rounded-md text-amber-800 hover:bg-amber-100 transition-colors"
              >
                View Database Logs
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
