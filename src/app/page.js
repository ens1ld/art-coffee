'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
          // Redirect to role-specific page if not on homepage
          if (window.location.pathname !== '/') {
            switch (profile.role) {
              case 'superadmin':
                router.push('/superadmin');
                break;
              case 'admin':
                router.push('/admin');
                break;
              default:
                router.push('/order');
            }
          }
        }
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Art Coffee</h1>
          {userRole ? (
            <div className="flex items-center gap-4">
              <span className="text-secondary">Welcome, {userRole}</span>
              <button
                onClick={handleLogout}
                className="btn-primary px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="btn-primary px-4 py-2 rounded"
            >
              Login
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Regular User Options */}
          <div
            onClick={() => router.push('/order')}
            className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-primary mb-2">Order Coffee</h2>
            <p className="text-secondary">Customize and order your favorite coffee</p>
          </div>

          <div
            onClick={() => router.push('/gift-card')}
            className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-primary mb-2">Gift Cards</h2>
            <p className="text-secondary">Purchase or redeem gift cards</p>
          </div>

          <div
            onClick={() => router.push('/loyalty')}
            className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-primary mb-2">Loyalty Program</h2>
            <p className="text-secondary">Track your points and rewards</p>
          </div>

          <div
            onClick={() => router.push('/bulk-order')}
            className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-primary mb-2">Bulk Order</h2>
            <p className="text-secondary">Place orders for groups or events</p>
          </div>

          {/* Admin Options - Only visible to admins and superadmins */}
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <div
              onClick={() => router.push('/admin')}
              className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-primary mb-2">Admin Dashboard</h2>
              <p className="text-secondary">Manage orders and analytics</p>
            </div>
          )}

          {/* Superadmin Options - Only visible to superadmins */}
          {userRole === 'superadmin' && (
            <div
              onClick={() => router.push('/superadmin')}
              className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-primary mb-2">Superadmin Panel</h2>
              <p className="text-secondary">Manage users and system settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
