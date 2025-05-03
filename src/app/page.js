'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) {
          setRole(profile.role);
        }
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="py-12 text-center relative">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-primary">Art Coffee</h1>
          <p className="text-xl text-secondary">Crafting the perfect cup, one bean at a time</p>
          {user && (
            <div className="absolute top-4 right-4 flex items-center gap-4">
              <span className="text-secondary">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm btn-primary rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order Coffee Card */}
          <a
            href="/order"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">☕</div>
              <h2 className="text-2xl font-bold text-primary">Order Coffee</h2>
            </div>
            <p className="text-secondary">Create your perfect coffee order with our premium selection</p>
          </a>

          {/* Bulk Order Card */}
          <a
            href="/bulk-order"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">📦</div>
              <h2 className="text-2xl font-bold text-primary">Bulk Order</h2>
            </div>
            <p className="text-secondary">Order in bulk for your office or special events</p>
          </a>

          {/* Gift Cards Card */}
          <a
            href="/gift-card"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">🎁</div>
              <h2 className="text-2xl font-bold text-primary">Gift Cards</h2>
            </div>
            <p className="text-secondary">Share the joy of coffee with our digital gift cards</p>
          </a>

          {/* Loyalty Program Card */}
          <a
            href="/loyalty"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">🎯</div>
              <h2 className="text-2xl font-bold text-primary">Loyalty Program</h2>
            </div>
            <p className="text-secondary">Earn points with every purchase and unlock rewards</p>
          </a>

          {/* Admin Dashboard Card - Only visible to admins and superadmins */}
          {(role === 'admin' || role === 'superadmin') && (
            <a
              href="/admin"
              className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">📋</div>
                <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>
              </div>
              <p className="text-secondary">Manage orders and view business analytics</p>
            </a>
          )}

          {/* Superadmin Panel Card - Only visible to superadmins */}
          {role === 'superadmin' && (
            <a
              href="/superadmin"
              className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">🛠️</div>
                <h2 className="text-2xl font-bold text-primary">Superadmin Panel</h2>
              </div>
              <p className="text-secondary">Manage users and system settings</p>
            </a>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-secondary">
        <p>© 2024 Art Coffee. All rights reserved.</p>
      </footer>
    </div>
  );
}
