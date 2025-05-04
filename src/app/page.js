'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProfile } from '@/components/ProfileFetcher';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { user, profile, isAdmin, isSuperadmin, loading } = useProfile();
  const [mounted, setMounted] = useState(false);
  const { translations } = useLanguage();
  
  // Set mounted state to true after component mounts (client side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-[#F9F5F0] pt-16 pb-24">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="heading-1 mb-6">
                {translations.home_hero_title}
              </h1>
              <p className="paragraph mb-8">
                {translations.home_hero_desc}
              </p>
              <div className="flex flex-wrap gap-4">
                {/* User not logged in - show order and menu links */}
                {!mounted || !user ? (
                  <>
                    <Link href="/order" className="btn-primary">
                      {translations.home_start_order}
                    </Link>
                    <Link href="/menu" className="btn-secondary">
                      {translations.home_view_menu}
                    </Link>
                  </>
                ) : (
                  <>
                    {/* User logged in - show relevant links based on role */}
                    <Link href="/order" className="btn-primary">
                      {translations.home_start_order}
                    </Link>
                    <Link href="/profile" className="btn-secondary">
                      {translations.home_my_profile}
                    </Link>
                    
                    {/* Admin and Superadmin links */}
                    {isAdmin && (
                      <Link href="/admin" className="btn-primary">
                        {translations.home_go_admin}
                      </Link>
                    )}
                    {isSuperadmin && (
                      <Link href="/superadmin" className="btn-secondary">
                        {translations.home_go_superadmin}
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="relative h-[400px] rounded-card overflow-hidden shadow-card">
                <Image
                  src="/images/cards/1.png"
                  alt="Art Coffee Cup"
                  fill
                  className="object-cover"
                  priority
                />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-[20%] right-[5%] w-28 h-28 rounded-full bg-accent-light/30 -z-0"></div>
        <div className="absolute bottom-[15%] left-[10%] w-16 h-16 rounded-full bg-primary-light/20 -z-0"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">
              {translations.home_why_choose}
            </h2>
            <p className="paragraph max-w-3xl mx-auto">
              {translations.home_why_desc}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_premium_quality}</h3>
              <p className="text-text-secondary">
                {translations.home_premium_desc}
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_personalized}</h3>
              <p className="text-text-secondary">
                {translations.home_personalized_desc}
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_loyalty}</h3>
              <p className="text-text-secondary">
                {translations.home_loyalty_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 bg-[#F9F5F0]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">
              {translations.home_services}
            </h2>
            <p className="paragraph max-w-3xl mx-auto">
              {translations.home_services_desc}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* These service cards are visible to all users */}
            <div className="card h-full flex flex-col">
              <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                <Image 
                  src="/images/cards/2.png" 
                  alt="Order Coffee"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_customize}</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                {translations.home_customize_desc}
              </p>
              <Link href="/order" className="btn-outline w-full text-center">
                {translations.home_order_now}
              </Link>
            </div>
            
            <div className="card h-full flex flex-col">
              <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                <Image 
                  src="/images/cards/4.png" 
                  alt="Gift Cards"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_gift_card}</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                {translations.home_gift_desc}
              </p>
              <Link href="/gift-card" className="btn-outline w-full text-center">
                {translations.home_send_gift}
              </Link>
            </div>
            
            <div className="card h-full flex flex-col">
              <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                <Image 
                  src="/images/cards/5.png" 
                  alt="Loyalty Program"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_earn_points}</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                {translations.home_earn_desc}
              </p>
              <Link href="/loyalty" className="btn-outline w-full text-center">
                {translations.home_view_loyalty}
              </Link>
            </div>
            
            {/* Added fourth service card for Bulk Orders */}
            <div className="card h-full flex flex-col lg:col-span-3">
              <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                <Image 
                  src="/images/cards/3.png" 
                  alt="Bulk Orders"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.home_bulk_order}</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                {translations.home_bulk_desc}
              </p>
              <Link href="/bulk-order" className="btn-outline w-full text-center">
                {translations.home_place_bulk}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Admin and Superadmin Sections - Only visible to those with access */}
      {mounted && (isAdmin || isSuperadmin) && (
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">
                {isAdmin && translations.nav_admin}
                {!isAdmin && isSuperadmin && translations.nav_superadmin}
                {(isAdmin && isSuperadmin) && `${translations.nav_admin} & ${translations.nav_superadmin}`}
              </h2>
              <p className="paragraph max-w-3xl mx-auto">
                {isAdmin && isSuperadmin 
                  ? 'Access your admin and superadmin dashboards to manage the system.' 
                  : isAdmin 
                    ? 'Access the admin dashboard to manage orders, products, and view analytics.' 
                    : 'Access the superadmin panel to manage users, settings, and system configuration.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isAdmin && (
                <div className="card h-full flex flex-col">
                  <div className="rounded-xl bg-amber-100 h-48 mb-6 relative overflow-hidden">
                    <Image 
                      src="/images/admin-dash.jpg" 
                      alt="Admin Dashboard"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.nav_admin}</h3>
                  <p className="text-text-secondary mb-6 flex-grow">
                    Manage orders, update menu items, view analytics, and handle day-to-day operations.
                  </p>
                  <Link href="/admin" className="btn-primary w-full text-center">
                    {translations.home_go_admin}
                  </Link>
                </div>
              )}
              
              {isSuperadmin && (
                <div className="card h-full flex flex-col">
                  <div className="rounded-xl bg-amber-100 h-48 mb-6 relative overflow-hidden">
                    <Image 
                      src="/images/superadmin-dash.jpg" 
                      alt="Superadmin Dashboard"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-primary mb-3">{translations.nav_superadmin}</h3>
                  <p className="text-text-secondary mb-6 flex-grow">
                    Manage user accounts, system settings, approve admin requests, and oversee all system data.
                  </p>
                  <Link href="/superadmin" className="btn-primary w-full text-center">
                    {translations.home_go_superadmin}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
}
