'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/components/ProfileFetcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, user, loading } = useProfile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="site-header">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-amber-900">
            Art Coffee
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-amber-900 hover:text-amber-700">
            Home
          </Link>
          <Link href="/about" className="text-amber-900 hover:text-amber-700">
            About
          </Link>
          <Link href="/menu" className="text-amber-900 hover:text-amber-700">
            Menu
          </Link>
          <Link href="/order" className="text-amber-900 hover:text-amber-700">
            Order
          </Link>
          <Link href="/loyalty" className="text-amber-900 hover:text-amber-700">
            Loyalty
          </Link>
          <Link href="/gift-card" className="text-amber-900 hover:text-amber-700">
            Gift Cards
          </Link>
          <Link href="/bulk-order" className="text-amber-900 hover:text-amber-700">
            Bulk Order
          </Link>
          
          {!loading && profile && (userRole === 'admin' || userRole === 'superadmin') && (
            <Link 
              href="/admin" 
              className={`font-medium transition-colors hover:text-primary ${isActive('/admin') ? 'text-primary' : 'text-text-secondary'}`}
            >
              Admin
            </Link>
          )}
          
          {!loading && profile && userRole === 'superadmin' && (
            <Link 
              href="/superadmin" 
              className={`font-medium transition-colors hover:text-primary ${isActive('/superadmin') ? 'text-primary' : 'text-text-secondary'}`}
            >
              Superadmin
            </Link>
          )}
        </nav>

        {/* Right side items */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          
          {/* Authentication Button */}
          {!loading && user ? (
            <div className="flex items-center space-x-2">
              <Link href="/profile" className="text-amber-900 hover:text-amber-700 mr-2">
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
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-amber-50 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link href="/" className="text-amber-900 hover:text-amber-700">
              Home
            </Link>
            <Link href="/about" className="text-amber-900 hover:text-amber-700">
              About
            </Link>
            <Link href="/menu" className="text-amber-900 hover:text-amber-700">
              Menu
            </Link>
            <Link href="/order" className="text-amber-900 hover:text-amber-700">
              Order
            </Link>
            <Link href="/loyalty" className="text-amber-900 hover:text-amber-700">
              Loyalty
            </Link>
            <Link href="/gift-card" className="text-amber-900 hover:text-amber-700">
              Gift Cards
            </Link>
            <Link href="/bulk-order" className="text-amber-900 hover:text-amber-700">
              Bulk Order
            </Link>
            
            {!loading && profile && (userRole === 'admin' || userRole === 'superadmin') && (
              <Link 
                href="/admin" 
                className={`font-medium transition-colors hover:text-primary ${isActive('/admin') ? 'text-primary' : 'text-text-secondary'}`}
              >
                Admin
              </Link>
            )}
            
            {!loading && profile && userRole === 'superadmin' && (
              <Link 
                href="/superadmin" 
                className={`font-medium transition-colors hover:text-primary ${isActive('/superadmin') ? 'text-primary' : 'text-text-secondary'}`}
              >
                Superadmin
              </Link>
            )}
            
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            
            {!loading && user ? (
              <>
                <Link href="/profile" className="text-amber-900 hover:text-amber-700">
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