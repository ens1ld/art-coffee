'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/components/ProfileFetcher';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const { profile, isAdmin, loading, error } = useProfile();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Admin dashboard features
  const features = [
    {
      id: 'orders',
      name: 'Orders',
      icon: '📦',
      description: 'Manage customer orders',
      link: '/admin/orders'
    },
    {
      id: 'loyalty',
      name: 'Loyalty Program',
      icon: '🎯',
      description: 'Manage loyalty points and rewards',
      link: '/admin/loyalty'
    },
    {
      id: 'menu',
      name: 'Menu Management',
      icon: '🧾',
      description: 'Add, edit, or remove menu items',
      link: '/admin/menu'
    },
    {
      id: 'customers',
      name: 'Customer Profiles',
      icon: '🪪',
      description: 'View and manage customer data',
      link: '/admin/customers'
    },
    {
      id: 'tables',
      name: 'Table QR Codes',
      icon: '🪑',
      description: 'Generate and manage table QR codes',
      link: '/admin/tables'
    },
    {
      id: 'gift-cards',
      name: 'Gift Cards',
      icon: '🎁',
      description: 'View and create gift cards',
      link: '/admin/gift-cards'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'View sales and performance data',
      link: '/admin/analytics'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Manage orders, customers, menu items, and more.
          </p>
          
          {profile && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center mb-6">
              <div className="mr-4 text-xl">👋</div>
              <div>
                <p className="font-medium text-amber-800">
                  Welcome, Admin {profile.email}
                </p>
                <p className="text-sm text-amber-700">
                  You have full access to the business management tools.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link href={feature.link} key={feature.id}>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h2 className="text-xl font-semibold text-amber-900 mb-2">{feature.name}</h2>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 p-4 rounded-md">
              <p className="text-sm text-amber-700">Active Orders</p>
              <p className="text-2xl font-bold text-amber-900">12</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-md">
              <p className="text-sm text-emerald-700">Today&apos;s Sales</p>
              <p className="text-2xl font-bold text-emerald-900">€320</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">Loyalty Members</p>
              <p className="text-2xl font-bold text-blue-900">42</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
