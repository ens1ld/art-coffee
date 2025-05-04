'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/components/ProfileFetcher';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Use profile context safely - it might be null during initial render
  const profileContext = useProfile?.() || {}; // Add fallback for undefined useProfile
  const profile = profileContext?.profile;
  const user = profileContext?.user;
  const loading = profileContext?.loading || false;
  const isAdmin = profileContext?.isAdmin || false;
  const isSuperadmin = profileContext?.isSuperadmin || false;
  
  // Get translations
  const { translations } = useLanguage();
  
  const pathname = usePathname();
  
  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);
  
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
      
      // Clear localStorage data to ensure complete sign out
      if (typeof window !== 'undefined') {
        // Clear cached profile data
        localStorage.removeItem('art-coffee-profile-cache');
        
        // Clear any other app data in localStorage
        localStorage.removeItem('supabase.auth.token');
        
        // Force a complete page refresh to clear all state
        window.location.href = '/?refresh=' + Date.now();
      }
    } catch (err) {
      console.error('Error signing out:', err);
      // If standard sign out fails, try a more aggressive approach
      if (typeof window !== 'undefined') {
        localStorage.clear(); // Clear all localStorage as a fallback
        window.location.href = '/';
      }
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
            {translations.nav_home}
          </Link>
          
          {/* User routes available to all authenticated users */}
          {mounted && user && (
            <>
              <Link href="/order" className={`text-amber-900 hover:text-amber-700 ${isActive('/order') ? 'font-semibold' : ''}`}>
                {translations.nav_order}
              </Link>
              <Link href="/loyalty" className={`text-amber-900 hover:text-amber-700 ${isActive('/loyalty') ? 'font-semibold' : ''}`}>
                {translations.nav_loyalty}
              </Link>
              <Link href="/gift-card" className={`text-amber-900 hover:text-amber-700 ${isActive('/gift-card') ? 'font-semibold' : ''}`}>
                {translations.nav_gift_cards}
              </Link>
              <Link href="/bulk-order" className={`text-amber-900 hover:text-amber-700 ${isActive('/bulk-order') ? 'font-semibold' : ''}`}>
                {translations.nav_bulk_order}
              </Link>
            </>
          )}
          
          {/* Admin links - only visible to admins and superadmins */}
          {mounted && isAdmin && (
            <Link 
              href="/admin" 
              className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
            >
              {translations.nav_admin}
            </Link>
          )}
          
          {/* Superadmin links - only visible to superadmins */}
          {mounted && isSuperadmin && (
            <Link 
              href="/superadmin" 
              className={`text-amber-900 hover:text-amber-700 ${isActive('/superadmin') ? 'font-semibold' : ''}`}
            >
              {translations.nav_superadmin}
            </Link>
          )}
        </nav>

        {/* Authentication Button and Language Switcher */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {mounted && user ? (
            <div className="flex items-center space-x-2">
              <Link 
                href="/profile" 
                className={`text-amber-900 hover:text-amber-700 mr-2 ${isActive('/profile') ? 'font-semibold' : ''}`}
              >
                {translations.nav_profile}
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-amber-800 text-amber-900 rounded-md hover:bg-amber-800 hover:text-white transition-colors"
              >
                {translations.nav_sign_out}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              {translations.nav_login}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-1">
          <LanguageSwitcher />
          <button
            className="text-amber-900"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - always shows basic navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-amber-50 py-4 border-t border-amber-200">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link href="/" className={`text-amber-900 hover:text-amber-700 ${isActive('/') ? 'font-semibold' : ''}`}>
              {translations.nav_home}
            </Link>
            
            {/* Only show user routes if authenticated */}
            {mounted && user && (
              <>
                <Link href="/order" className={`text-amber-900 hover:text-amber-700 ${isActive('/order') ? 'font-semibold' : ''}`}>
                  {translations.nav_order}
                </Link>
                <Link href="/loyalty" className={`text-amber-900 hover:text-amber-700 ${isActive('/loyalty') ? 'font-semibold' : ''}`}>
                  {translations.nav_loyalty}
                </Link>
                <Link href="/gift-card" className={`text-amber-900 hover:text-amber-700 ${isActive('/gift-card') ? 'font-semibold' : ''}`}>
                  {translations.nav_gift_cards}
                </Link>
                <Link href="/bulk-order" className={`text-amber-900 hover:text-amber-700 ${isActive('/bulk-order') ? 'font-semibold' : ''}`}>
                  {translations.nav_bulk_order}
                </Link>
              </>
            )}
            
            {/* Admin links shown conditionally */}
            {mounted && isAdmin && (
              <Link 
                href="/admin" 
                className={`text-amber-900 hover:text-amber-700 ${isActive('/admin') ? 'font-semibold' : ''}`}
              >
                {translations.nav_admin}
              </Link>
            )}
            
            {/* Superadmin links shown conditionally */}
            {mounted && isSuperadmin && (
              <Link 
                href="/superadmin" 
                className={`text-amber-900 hover:text-amber-700 ${isActive('/superadmin') ? 'font-semibold' : ''}`}
              >
                {translations.nav_superadmin}
              </Link>
            )}
            
            {mounted && user ? (
              <>
                <Link 
                  href="/profile" 
                  className={`text-amber-900 hover:text-amber-700 ${isActive('/profile') ? 'font-semibold' : ''}`}
                >
                  {translations.nav_profile}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-amber-900 hover:text-amber-700"
                >
                  {translations.nav_sign_out}
                </button>
              </>
            ) : (
              <Link href="/login" className="text-amber-900 hover:text-amber-700">
                {translations.nav_login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 