'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/components/ProfileFetcher';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, user, loading } = useProfile();
  const pathname = usePathname();
  
  // Helper function to check if a path is active
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-amber-50 py-4 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-amber-900 flex items-center">
            <img src="/logo.svg" alt="Art Coffee" width="30" height="30" className="mr-2" />
            Art Coffee
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className={`text-amber-900 hover:text-amber-700 ${isActive('/') ? 'font-semibold' : ''}`}>
            Home
          </Link>
          <Link href="/order" className={`text-amber-900 hover:text-amber-700 ${isActive('/order') ? 'font-semibold' : ''}`}>
            Order
          </Link>
          <Link href="/loyalty" className={`text-amber-900 hover:text-amber-700 ${isActive('/loyalty') ? 'font-semibold' : ''}`}>
            Loyalty
          </Link>
          <Link href="/gift-card" className={`text-amber-900 hover:text-amber-700 ${isActive('/gift-card') ? 'font-semibold' : ''}`}>
            Gift Cards
          </Link>
          <Link href="/bulk-order" className={`text-amber-900 hover:text-amber-700 ${isActive('/bulk-order') ? 'font-semibold' : ''}`}>
            Bulk Order
          </Link>
          
          {!loading && profile && profile.role === 'admin' && profile.approved && (
            <Link 
              href="/admin" 
              className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
            >
              Admin
            </Link>
          )}
          
          {!loading && profile && profile.role === 'superadmin' && (
            <>
              <Link 
                href="/admin" 
                className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
              >
                Admin
              </Link>
              <Link 
                href="/superadmin" 
                className={`text-amber-900 hover:text-amber-700 ${isActive('/superadmin') ? 'font-semibold' : ''}`}
              >
                Superadmin
              </Link>
            </>
          )}
        </nav>

        {/* Authentication Button */}
        <div className="hidden md:block">
          {!loading && user ? (
            <div className="flex items-center space-x-2">
              <Link href="/profile" className={`text-amber-900 hover:text-amber-700 mr-2 ${isActive('/profile') ? 'font-semibold' : ''}`}>
                My Profile
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="px-4 py-2 border border-amber-800 text-amber-900 rounded-md hover:bg-amber-800 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-amber-900"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-amber-50 py-4 border-t border-amber-200">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link href="/" className={`text-amber-900 hover:text-amber-700 ${isActive('/') ? 'font-semibold' : ''}`}>
              Home
            </Link>
            <Link href="/order" className={`text-amber-900 hover:text-amber-700 ${isActive('/order') ? 'font-semibold' : ''}`}>
              Order
            </Link>
            <Link href="/loyalty" className={`text-amber-900 hover:text-amber-700 ${isActive('/loyalty') ? 'font-semibold' : ''}`}>
              Loyalty
            </Link>
            <Link href="/gift-card" className={`text-amber-900 hover:text-amber-700 ${isActive('/gift-card') ? 'font-semibold' : ''}`}>
              Gift Cards
            </Link>
            <Link href="/bulk-order" className={`text-amber-900 hover:text-amber-700 ${isActive('/bulk-order') ? 'font-semibold' : ''}`}>
              Bulk Order
            </Link>
            
            {!loading && profile && profile.role === 'admin' && profile.approved && (
              <Link 
                href="/admin" 
                className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
              >
                Admin
              </Link>
            )}
            
            {!loading && profile && profile.role === 'superadmin' && (
              <>
                <Link 
                  href="/admin" 
                  className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
                >
                  Admin
                </Link>
                <Link 
                  href="/superadmin" 
                  className={`text-amber-900 hover:text-amber-700 ${isActive('/superadmin') ? 'font-semibold' : ''}`}
                >
                  Superadmin
                </Link>
              </>
            )}
            
            {!loading && user ? (
              <>
                <Link href="/profile" className={`text-amber-900 hover:text-amber-700 ${isActive('/profile') ? 'font-semibold' : ''}`}>
                  My Profile
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="text-left text-amber-900 hover:text-amber-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" className="text-amber-900 hover:text-amber-700">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 