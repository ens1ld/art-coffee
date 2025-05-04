'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SuperadminDashboard() {
  const { profile, loading, error } = useProfile();
  const router = useRouter();
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    pendingAdmins: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [serverStatus, setServerStatus] = useState({
    database: 'healthy',
    storage: 'healthy',
    auth: 'healthy',
    api: 'healthy'
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  // Check if user is superadmin
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== 'superadmin') {
        router.push('/not-authorized');
      }
    }
  }, [loading, profile, router]);

  // Fetch stats and data
  useEffect(() => {
    async function fetchData() {
      try {
        setStatsLoading(true);
        
        // In a real app, this would fetch from Supabase
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Set placeholder stats
        setStats({
          totalUsers: 152,
          totalAdmins: 8,
          pendingAdmins: 3,
          totalOrders: 3875,
          totalRevenue: 48792.50,
          totalProducts: 42
        });
        
        // Set placeholder recent users
        setRecentUsers([
          { id: 'usr-1', email: 'new.customer@example.com', role: 'user', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { id: 'usr-2', email: 'staff.member@artcoffee.com', role: 'admin', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), approved: true },
          { id: 'usr-3', email: 'pending.admin@example.com', role: 'admin', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), approved: false },
          { id: 'usr-4', email: 'another.user@example.com', role: 'user', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ]);
        
        // Set placeholder recent logs
        setRecentLogs([
          { id: 'log-1', type: 'auth', message: 'Failed login attempt', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), level: 'warning' },
          { id: 'log-2', type: 'database', message: 'Database backup completed', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), level: 'info' },
          { id: 'log-3', type: 'auth', message: 'New admin account created', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), level: 'info' },
          { id: 'log-4', type: 'api', message: 'High API usage detected', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), level: 'warning' }
        ]);
        
      } catch (error) {
        console.error('Error fetching superadmin data:', error);
      } finally {
        setStatsLoading(false);
      }
    }

    if (profile && profile.role === 'superadmin') {
      fetchData();
    }
  }, [profile]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get log level badge
  const getLogLevelBadge = (level) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user is not authorized
  if (!profile || profile.role !== 'superadmin') {
    return null; // Already redirecting in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Superadmin Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">User Management</h2>
            {statsLoading ? (
              <div className="h-16 flex items-center">
                <div className="animate-pulse w-full h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <span>{stats.totalAdmins} Admins</span>
                  <span className="mx-2">•</span>
                  <span className="text-amber-600">{stats.pendingAdmins} Pending Approval</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Order Statistics</h2>
            {statsLoading ? (
              <div className="h-16 flex items-center">
                <div className="animate-pulse w-full h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <span>Total Orders</span>
                  <span className="mx-2">•</span>
                  <span className="text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">System Status</h2>
            {statsLoading ? (
              <div className="h-16 flex items-center">
                <div className="animate-pulse w-full h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(serverStatus.database)}`}>
                    Database
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(serverStatus.storage)}`}>
                    Storage
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(serverStatus.auth)}`}>
                    Auth
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(serverStatus.api)}`}>
                    API
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Admin Tools */}
        <h2 className="text-xl font-semibold text-amber-900 mb-4">Superadmin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/superadmin/manage-users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-md bg-amber-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-amber-900">User Management</h3>
                <p className="text-sm text-gray-500">Manage users, roles and permissions</p>
              </div>
            </div>
          </Link>
          
          <Link href="/superadmin/system-settings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-md bg-amber-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-amber-900">System Settings</h3>
                <p className="text-sm text-gray-500">Configure global application settings</p>
              </div>
            </div>
          </Link>
          
          <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-md bg-amber-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-amber-900">Supabase Dashboard</h3>
                <p className="text-sm text-gray-500">Access the Supabase admin interface</p>
              </div>
            </div>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-md bg-blue-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-800">Admin Dashboard</h3>
                <p className="text-sm text-gray-500">Go to regular admin dashboard</p>
              </div>
            </div>
          </Link>
          
          <Link href="/order" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-md bg-green-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-800">Order Interface</h3>
                <p className="text-sm text-gray-500">View the customer ordering interface</p>
              </div>
            </div>
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.reload()}>
            <div className="flex items-center">
              <div className="rounded-md bg-gray-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Refresh Dashboard</h3>
                <p className="text-sm text-gray-500">Reload all stats and data</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-amber-900">Recent Users</h3>
            </div>
            
            {statsLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-amber-800 font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'superadmin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                        {user.role === 'admin' && !user.approved && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No recent users found
                  </div>
                )}
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50">
              <Link href="/superadmin/manage-users" className="text-sm font-medium text-amber-800 hover:text-amber-700">
                View All Users <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          {/* System Logs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-amber-900">Recent System Logs</h3>
            </div>
            
            {statsLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogLevelBadge(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">{log.type}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{log.message}</div>
                  </div>
                ))}
                {recentLogs.length === 0 && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No recent logs found
                  </div>
                )}
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50">
              <Link href="/superadmin/system-settings" className="text-sm font-medium text-amber-800 hover:text-amber-700">
                View System Settings <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
