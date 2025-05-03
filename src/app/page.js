'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        }
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="bg-card-bg border-b border-card-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Art Coffee
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-secondary hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-secondary hover:text-primary transition-colors">
              Contact
            </Link>
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
              <Link
                href="/auth"
                className="btn-primary px-4 py-2 rounded"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Welcome to Art Coffee
          </h1>
          <p className="text-xl text-secondary mb-8">
            Discover our premium selection of handcrafted coffees and artisanal blends
          </p>
          <Link
            href="/menu"
            className="btn-primary px-6 py-3 rounded text-lg"
          >
            View Our Menu
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-card-bg">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            Our Signature Blends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background border border-card-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-2">Classic Blend</h3>
              <p className="text-secondary mb-4">Our signature medium roast with notes of chocolate and caramel</p>
              <Link href="/menu" className="text-primary hover:underline">
                Learn More →
              </Link>
            </div>
            <div className="bg-background border border-card-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-2">Single Origin</h3>
              <p className="text-secondary mb-4">Premium beans sourced from the finest coffee regions</p>
              <Link href="/menu" className="text-primary hover:underline">
                Learn More →
              </Link>
            </div>
            <div className="bg-background border border-card-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-2">Seasonal Special</h3>
              <p className="text-secondary mb-4">Limited edition blends that change with the seasons</p>
              <Link href="/menu" className="text-primary hover:underline">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Protected Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            Member Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => router.push(userRole ? '/order' : '/auth')}
              className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Order Coffee</h3>
              <p className="text-secondary">Customize and order your favorite coffee</p>
            </div>

            <div
              onClick={() => router.push(userRole ? '/gift-card' : '/auth')}
              className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Gift Cards</h3>
              <p className="text-secondary">Purchase or redeem gift cards</p>
            </div>

            <div
              onClick={() => router.push(userRole ? '/loyalty' : '/auth')}
              className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Loyalty Program</h3>
              <p className="text-secondary">Track your points and rewards</p>
            </div>

            {/* Admin Options - Only visible to admins and superadmins */}
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <div
                onClick={() => router.push('/admin')}
                className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">Admin Dashboard</h3>
                <p className="text-secondary">Manage orders and analytics</p>
              </div>
            )}

            {/* Superadmin Options - Only visible to superadmins */}
            {userRole === 'superadmin' && (
              <div
                onClick={() => router.push('/superadmin')}
                className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">Superadmin Panel</h3>
                <p className="text-secondary">Manage users and system settings</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card-bg border-t border-card-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Art Coffee</h3>
              <p className="text-secondary">
                Crafting the perfect cup, one bean at a time
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-secondary hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-secondary hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="text-secondary hover:text-primary">
                    Menu
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Contact Us</h3>
              <p className="text-secondary">
                Email: info@artcoffee.com<br />
                Phone: (123) 456-7890<br />
                Address: 123 Coffee Street, City
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-secondary">
            <p>© 2024 Art Coffee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
