'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        setError('No active session.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        setError('Could not retrieve profile.');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-lg">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error || 'No profile data found.'}</p>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 mr-2"
            >
              Sign In
            </button>
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 border border-amber-800 text-amber-800 rounded hover:bg-amber-50"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        <div className="bg-amber-50 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Account Information</h2>
            <div className="bg-white rounded p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">User Role</p>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-medium">
                  {profile.role === 'admin' && !profile.approved ? (
                    <span className="text-orange-500">Pending Approval</span>
                  ) : (
                    <span className="text-green-500">Active</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {(profile.role === 'admin' || profile.role === 'superadmin') && profile.approved && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Admin Access</h2>
              <div className="bg-white rounded p-4 shadow-sm">
                <p className="mb-3">You have administrative privileges.</p>
                <div className="flex flex-wrap gap-2">
                  {profile.role === 'admin' && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  {profile.role === 'superadmin' && (
                    <button
                      onClick={() => router.push('/superadmin')}
                      className="px-4 py-2 bg-amber-900 text-white rounded hover:bg-amber-800"
                    >
                      Superadmin Panel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-amber-800 text-amber-800 rounded hover:bg-amber-50"
            >
              Back to Home
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
