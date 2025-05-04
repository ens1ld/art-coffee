'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/components/ProfileFetcher';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ApproveAdminsPage() {
  const router = useRouter();
  const { profile, user, loading, error } = useProfile();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

  // Load pending admin accounts
  useEffect(() => {
    if (user && profile && profile.role === 'superadmin') {
      fetchPendingAdmins();
    }
  }, [user, profile]);

  const fetchPendingAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .eq('approved', false);

      if (error) throw error;
      setPendingAdmins(data || []);
    } catch (err) {
      console.error('Error fetching pending admins:', err);
      setActionStatus({
        type: 'error',
        message: `Failed to load pending admin accounts: ${err.message}`
      });
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleApprove = async (adminId) => {
    try {
      setActionStatus({ type: 'loading', message: 'Approving admin...' });
      
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', adminId);

      if (error) throw error;
      
      // Update the local state
      setPendingAdmins(pendingAdmins.filter(admin => admin.id !== adminId));
      
      setActionStatus({
        type: 'success',
        message: 'Admin approved successfully!'
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Error approving admin:', err);
      setActionStatus({
        type: 'error',
        message: `Failed to approve admin: ${err.message}`
      });
    }
  };

  const handleReject = async (adminId) => {
    try {
      setActionStatus({ type: 'loading', message: 'Rejecting admin...' });
      
      // Update to regular user role instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user', approved: true })
        .eq('id', adminId);

      if (error) throw error;
      
      // Update the local state
      setPendingAdmins(pendingAdmins.filter(admin => admin.id !== adminId));
      
      setActionStatus({
        type: 'success',
        message: 'Admin request rejected'
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Error rejecting admin:', err);
      setActionStatus({
        type: 'error',
        message: `Failed to reject admin: ${err.message}`
      });
    }
  };

  // Handle unauthorized access
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
              onClick={() => router.push('/login?redirectTo=/superadmin/approve-admins')}
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

  // Check if user is superadmin
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Approve Admin Accounts</h1>
              <p className="text-gray-600">Review and manage pending admin account requests</p>
            </div>
            <button 
              onClick={() => router.push('/superadmin')}
              className="px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50"
            >
              Back to Dashboard
            </button>
          </div>
          
          {actionStatus.message && (
            <div className={`mb-6 p-4 rounded-md ${
              actionStatus.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
              actionStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
              'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {actionStatus.message}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-amber-800">Pending Approvals</h2>
            </div>
            
            {loadingAdmins ? (
              <div className="p-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-800 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600">Loading pending admins...</p>
              </div>
            ) : pendingAdmins.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Pending Approvals</h3>
                <p className="text-gray-600">There are no admin accounts waiting for approval at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 truncate max-w-[150px]">{admin.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(admin.id)}
                              className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(admin.id)}
                              className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">About Admin Approvals</h2>
            <div className="text-gray-600">
              <p className="mb-3">
                When users sign up and request admin privileges, their accounts are created with the admin role but are marked as unapproved.
                These users cannot access admin features until a superadmin approves their account.
              </p>
              <p>
                As a superadmin, you can approve legitimate admins or reject the request, which will convert their account to a regular user.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 