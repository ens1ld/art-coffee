'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Logo from './Logo';

export default function Navigation() {
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
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
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="site-header">
      <div className="container-custom flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/order" 
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/order') ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            Order
          </Link>
          <Link 
            href="/loyalty" 
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/loyalty') ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            Loyalty
          </Link>
          <Link 
            href="/gift-card" 
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/gift-card') ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            Gift Cards
          </Link>
          <Link 
            href="/bulk-order" 
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/bulk-order') ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            Bulk Order
          </Link>
          
          {userRole === 'admin' || userRole === 'superadmin' ? (
            <Link 
              href="/admin" 
              className={`font-medium transition-colors hover:text-primary ${
                isActive('/admin') ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              Admin
            </Link>
          ) : null}
          
          {userRole === 'superadmin' && (
            <Link 
              href="/superadmin" 
              className={`font-medium transition-colors hover:text-primary ${
                isActive('/superadmin') ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              Superadmin
            </Link>
          )}
          
          {userRole ? (
            <button 
              onClick={handleLogout}
              className="btn-outline"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="btn-primary">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-text-DEFAULT"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border py-4 shadow-lg">
          <div className="container-custom flex flex-col gap-4">
            <Link 
              href="/order" 
              className={`font-medium transition-colors py-2 hover:text-primary ${
                isActive('/order') ? 'text-primary' : 'text-text-secondary'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Order
            </Link>
            <Link 
              href="/loyalty" 
              className={`font-medium transition-colors py-2 hover:text-primary ${
                isActive('/loyalty') ? 'text-primary' : 'text-text-secondary'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Loyalty
            </Link>
            <Link 
              href="/gift-card" 
              className={`font-medium transition-colors py-2 hover:text-primary ${
                isActive('/gift-card') ? 'text-primary' : 'text-text-secondary'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Gift Cards
            </Link>
            <Link 
              href="/bulk-order" 
              className={`font-medium transition-colors py-2 hover:text-primary ${
                isActive('/bulk-order') ? 'text-primary' : 'text-text-secondary'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Bulk Order
            </Link>
            
            {userRole === 'admin' || userRole === 'superadmin' ? (
              <Link 
                href="/admin" 
                className={`font-medium transition-colors py-2 hover:text-primary ${
                  isActive('/admin') ? 'text-primary' : 'text-text-secondary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            ) : null}
            
            {userRole === 'superadmin' && (
              <Link 
                href="/superadmin" 
                className={`font-medium transition-colors py-2 hover:text-primary ${
                  isActive('/superadmin') ? 'text-primary' : 'text-text-secondary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Superadmin
              </Link>
            )}
            
            {userRole ? (
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="btn-outline text-center"
              >
                Logout
              </button>
            ) : (
              <Link 
                href="/login" 
                className="btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 