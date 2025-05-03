'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to true after component mounts (client side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user data on the client side only
  useEffect(() => {
    if (!mounted) return;
    
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
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };
    
    checkUser();
  }, [mounted]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-[#F9F5F0] pt-16 pb-24">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="heading-1 mb-6">
                Experience Artisanal Coffee at Its Finest
              </h1>
              <p className="paragraph mb-8">
                At Art Coffee, we craft each cup with passion and precision, using only the finest beans sourced from around the world. Discover flavors that tell a story.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/order" className="btn-primary">
                  Start Your Order
                </Link>
                <Link href="/menu" className="btn-secondary">
                  View Menu
                </Link>
                
                {/* Direct profile link for testing */}
                {mounted && user && (
                  <Link href="/profile" className="btn-secondary">
                    My Profile
                  </Link>
                )}
              </div>
            </div>
            <div className="relative h-[400px] rounded-card overflow-hidden shadow-card">
                <Image
                  src="/images/hero-coffee.jpg"
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
              Why Choose Art Coffee
            </h2>
            <p className="paragraph max-w-3xl mx-auto">
              Discover what makes our coffee experience unique and why our customers keep coming back for more.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Premium Quality</h3>
              <p className="text-text-secondary">
                We select only the highest-quality beans, expertly roasted to bring out their unique flavors.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Personalized Orders</h3>
              <p className="text-text-secondary">
                Customize your coffee just the way you like it. We craft each cup to match your preferences.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Loyalty Rewards</h3>
              <p className="text-text-secondary">
                Earn points with every purchase and enjoy special rewards to enhance your coffee experience.
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
              Our Services
            </h2>
            <p className="paragraph max-w-3xl mx-auto">
              Explore our range of services designed to make your coffee experience exceptional.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card h-full flex flex-col">
              <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                <Image 
                  src="/images/cards/2.png" 
                  alt="Order Coffee"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Customize Your Order</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                Create your perfect cup with our wide range of customization options. Choose your beans, brewing method, and add-ons.
              </p>
              <Link href="/order" className="btn-outline w-full text-center">
                Order Now
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
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Send a Gift Card</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                Share the gift of exceptional coffee with friends and family. Personalize your gift card with a custom message.
              </p>
              <Link href="/gift-card" className="btn-outline w-full text-center">
                Send Gift Card
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
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Earn Loyalty Points</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                Join our loyalty program and earn points with every purchase. Redeem for free drinks, special offers, and more.
              </p>
              <Link href="/loyalty" className="btn-outline w-full text-center">
                Join Loyalty Program
              </Link>
            </div>
            
            <div className="card h-full flex flex-col">
              <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                <Image
                  src="/images/bulk-order.jpg" 
                  alt="Bulk Orders"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif font-semibold text-primary mb-3">Bulk Orders</h3>
              <p className="text-text-secondary mb-6 flex-grow">
                Perfect for events, office meetings, or large gatherings. Place bulk orders with special discounts.
              </p>
              <Link href="/bulk-order" className="btn-outline w-full text-center">
                Place Bulk Order
              </Link>
            </div>
            
            {/* Admin links - conditionally rendered based on role */}
            {mounted && userRole === 'admin' && (
              <div className="card h-full flex flex-col">
                <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                  <Image 
                    src="/images/cards/admin.jpg" 
                    alt="Admin Dashboard"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">Admin Dashboard</h3>
                <p className="text-text-secondary mb-6 flex-grow">
                  Manage orders, view analytics, and handle customer data through our comprehensive admin interface.
                </p>
                <Link href="/admin" className="btn-outline w-full text-center">
                  Access Admin
                </Link>
              </div>
            )}
            
            {/* Superadmin links - conditionally rendered based on role */}
            {mounted && userRole === 'superadmin' && (
              <div className="card h-full flex flex-col">
                <div className="rounded-xl bg-primary/10 h-48 mb-6 relative overflow-hidden">
                  <Image 
                    src="/images/cards/superadmin.jpg" 
                    alt="Superadmin Panel"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">Superadmin Panel</h3>
                <p className="text-text-secondary mb-6 flex-grow">
                  Full system access to manage users, roles, and application settings.
                </p>
                <Link href="/superadmin" className="btn-outline w-full text-center">
                  Access Superadmin
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">
              What Our Customers Say
            </h2>
            <p className="paragraph max-w-3xl mx-auto">
              Don&apos;t just take our word for it. Hear from our happy customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-secondary italic mb-6">
                &quot;Art Coffee has become my daily ritual. The quality is unmatched, and the customization options let me experiment with new flavors.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                <div>
                  <p className="font-medium text-primary">Sarah Johnson</p>
                  <p className="text-sm text-text-light">Regular Customer</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-secondary italic mb-6">
                &quot;The loyalty program is fantastic! I&apos;ve earned free coffees and exclusive offers. Plus, the mobile ordering makes my morning commute so much easier.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                <div>
                  <p className="font-medium text-primary">Michael Chen</p>
                  <p className="text-sm text-text-light">Loyalty Member</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-secondary italic mb-6">
                &quot;I ordered gift cards for my team, and everyone was thrilled. The personalization options made each card special, and the coffee quality exceeded expectations.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                <div>
                  <p className="font-medium text-primary">Emma Rodriguez</p>
                  <p className="text-sm text-text-light">Business Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready to Experience Art Coffee?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Start your coffee journey today and discover why our customers keep coming back.
          </p>
          <Link href="/order" className="inline-block bg-white text-primary font-medium py-3 px-8 rounded-button shadow-md hover:shadow-lg transition-all hover:bg-gray-100">
            Start Your Order
          </Link>
        </div>
      </section>

      {user && (
        <Link 
          href="/profile" 
          className="mt-4 inline-block px-6 py-3 bg-amber-800 text-white rounded-lg shadow hover:bg-amber-700 transition-colors"
        >
          View Your Profile
        </Link>
      )}

      <Footer />
    </div>
  );
}
