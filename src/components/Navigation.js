'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/components/ProfileFetcher';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Use profile context safely - it might be null during initial render
  const profileContext = useProfile?.() || {}; // Add fallback for undefined useProfile
  const profile = profileContext?.profile;
  const user = profileContext?.user;
  const loading = profileContext?.loading || false;
  
  const pathname = usePathname();
  
  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
    console.log('Navigation component mounted, auth state:', !!user);
  }, [user]);
  
  // Helper function to check if a path is active
  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle sign out in a consistent way
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <header className="bg-amber-50 py-4 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-amber-900 flex items-center">
            <Image src="/logo.svg" alt="Art Coffee" width={30} height={30} className="mr-2" />
            Art Coffee
          </Link>
        </div>

        {/* Desktop Navigation - always visible for all users */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className={`text-amber-900 hover:text-amber-700 ${isActive('/') ? 'font-semibold' : ''}`}>
            Home
          </Link>
          {/* Only show member links for normal users */}
          {(!profile?.role || profile?.role === 'user') && (
            <>
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
            </>
          )}
          {/* Only show admin/superadmin links for those roles */}
          {profile?.role === 'admin' && profile.approved && (
            <Link 
              href="/admin" 
              className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
            >
              Admin
            </Link>
          )}
          
          {profile?.role === 'superadmin' && (
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
          {mounted && user ? (
            <div className="flex items-center space-x-2">
              <Link 
                href="/profile" 
                className={`text-amber-900 hover:text-amber-700 mr-2 ${isActive('/profile') ? 'font-semibold' : ''}`}
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-amber-800 text-amber-900 rounded-md hover:bg-amber-800 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
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

      {/* Mobile Menu - always shows basic navigation */}
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
            
            {/* Admin links shown conditionally */}
            {mounted && profile?.role === 'admin' && profile.approved && (
              <Link 
                href="/admin" 
                className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
              >
                Admin
              </Link>
            )}
            
            {mounted && profile?.role === 'superadmin' && (
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
            
            {mounted && user ? (
              <>
                <Link 
                  href="/profile" 
                  className={`text-amber-900 hover:text-amber-700 ${isActive('/profile') ? 'font-semibold' : ''}`}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-amber-900 hover:text-amber-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-amber-900 hover:text-amber-700">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 