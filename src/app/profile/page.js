'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const { user, profile, loading, error } = useProfile();
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>Error loading profile: {error.message || 'Unknown error'}</p>
          </div>
          <p>Please try refreshing the page or sign out and sign back in.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6">
            <p>You need to be logged in to view your profile.</p>
          </div>
          <a href="/auth" className="inline-block bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700">
            Login / Sign Up
          </a>
        </div>
      </div>
    );
  }

  const getUserRoleDisplay = () => {
    if (!profile) return 'Loading...';
    
    switch (profile.role) {
      case 'user':
        return 'Customer';
      case 'admin':
        return profile.approved ? 'Administrator (Approved)' : 'Administrator (Pending Approval)';
      case 'superadmin':
        return 'Super Administrator';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
        
        {updateStatus.message && (
          <div className={`border-l-4 p-4 mb-6 ${
            updateStatus.type === 'success' 
              ? 'bg-green-100 border-green-500 text-green-700' 
              : 'bg-red-100 border-red-500 text-red-700'
          }`}>
            <p>{updateStatus.message}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Account Information</h2>
            <div className="bg-amber-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">User ID</p>
                  <p className="font-medium text-sm overflow-ellipsis overflow-hidden">{user.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Account Type</p>
                  <p className="font-medium">{getUserRoleDisplay()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email Verified</p>
                  <p className="font-medium">{user.email_confirmed_at ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {profile && (
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Profile Settings</h2>
              <div className="bg-amber-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Created At</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Updated</p>
                    <p className="font-medium">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Account Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
                    if (error) throw error;
                    setUpdateStatus({
                      message: 'Password reset email sent to your email address',
                      type: 'success',
                    });
                  } catch (error) {
                    setUpdateStatus({
                      message: `Error sending reset email: ${error.message}`,
                      type: 'error',
                    });
                  }
                }}
                className="px-4 py-2 border border-amber-800 text-amber-900 rounded-md hover:bg-amber-100 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
