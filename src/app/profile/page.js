'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProfileFetcherWithRenderProps from '@/components/ProfileFetcher';

// Sample data that would normally come from the database
const mockFavorites = [
  { id: 'p1', name: 'Caramel Macchiato', image: '/logo.svg', price: 4.99, category: 'Coffee' },
  { id: 'p2', name: 'Blueberry Muffin', image: '/logo.svg', price: 3.49, category: 'Pastry' },
  { id: 'p3', name: 'Cold Brew', image: '/logo.svg', price: 4.49, category: 'Coffee' }
];

const mockOrders = [
  { id: '1001', date: '2023-06-15', items: ['Caramel Macchiato', 'Blueberry Muffin'], total: 8.48, status: 'Completed' },
  { id: '1002', date: '2023-06-10', items: ['Cold Brew', 'Chocolate Croissant'], total: 7.98, status: 'Completed' },
  { id: '1003', date: '2023-05-28', items: ['Americano', 'Breakfast Sandwich'], total: 9.47, status: 'Completed' },
];

const mockPreferences = {
  favoriteProducts: ['Caramel Macchiato', 'Cold Brew', 'Blueberry Muffin'],
  dietaryPreferences: ['Low sugar options', 'Dairy alternatives available'],
  suggestedItems: [
    { id: 's1', name: 'Vanilla Latte', reason: 'Based on your love for Caramel Macchiato' },
    { id: 's2', name: 'Nitro Cold Brew', reason: 'Since you enjoy our Cold Brew' },
    { id: 's3', name: 'Banana Bread', reason: 'Pairs well with your favorite coffee choices' }
  ]
};

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState(mockFavorites);
  const [orders, setOrders] = useState(mockOrders);
  const [preferences, setPreferences] = useState(mockPreferences);
  const [lastProfile, setLastProfile] = useState(null);

  // Client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle role-based redirects
  const handleProfileUpdate = useCallback((profile) => {
    if (!mounted || !profile) return;
    
    setLastProfile(profile);
    
    // Redirect based on role
    if (profile.role === 'admin' && !profile.approved) {
      router.push('/pending-approval');
    } else if (profile.role === 'admin' && profile.approved) {
      router.push('/admin');
    } else if (profile.role === 'superadmin') {
      router.push('/superadmin');
    }
  }, [mounted, router]);

  // Effect to handle profile updates
  useEffect(() => {
    if (lastProfile) {
      handleProfileUpdate(lastProfile);
    }
  }, [lastProfile, handleProfileUpdate]);

  const handleRemoveFavorite = (itemId) => {
    // In a real implementation, this would call an API to remove from favorites
    setFavorites(favorites.filter(item => item.id !== itemId));
    setUpdateStatus({
      message: 'Item removed from favorites',
      type: 'success'
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserRoleDisplay = (profile) => {
    if (!profile) return 'Loading...';
    
    switch (profile.role) {
      case 'user':
        return 'Customer';
      case 'admin':
        return profile.approved ? 'Administrator (Approved)' : 'Administrator (Pending Approval)';
      case 'superadmin':
        return 'Super Administrator';
      default:
        return 'Unknown';
    }
  };

  const renderTabContent = (profile) => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Account Information</h2>
              <div className="bg-amber-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">User ID</p>
                    <p className="font-medium text-sm overflow-ellipsis overflow-hidden">{profile.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Type</p>
                    <p className="font-medium">{getUserRoleDisplay(profile)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Status</p>
                    <p className="font-medium">{profile.approved ? 'Approved' : 'Pending Approval'}</p>
                  </div>
                </div>
              </div>
            </div>

            {profile && (
              <div>
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Profile Settings</h2>
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Created At</p>
                      <p className="font-medium">
                        {mounted && profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Last Updated</p>
                      <p className="font-medium">
                        {mounted && profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Recent Orders</h2>
              {orders.length > 0 ? (
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200">
                          <th className="px-4 py-2 text-left">Order ID</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Items</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 3).map(order => (
                          <tr key={order.id} className="border-b border-amber-100">
                            <td className="px-4 py-3">{order.id}</td>
                            <td className="px-4 py-3">{order.date}</td>
                            <td className="px-4 py-3">{order.items.join(', ')}</td>
                            <td className="px-4 py-3 text-right">${order.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-right">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-amber-800 hover:text-amber-700 text-sm font-medium"
                    >
                      View all orders →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-md text-gray-600">
                  You haven&apos;t placed any orders yet.
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Recommendations For You</h2>
              <div className="bg-amber-50 p-4 rounded-md">
                <div className="space-y-3">
                  {preferences.suggestedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b border-amber-100 pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.reason}</p>
                      </div>
                      <button className="text-amber-800 hover:text-amber-700 text-sm">
                        Order Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div>
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Your Order History</h2>
            {orders.length > 0 ? (
              <div className="bg-amber-50 p-4 rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="px-4 py-2 text-left">Order ID</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Items</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-amber-100">
                          <td className="px-4 py-3">{order.id}</td>
                          <td className="px-4 py-3">{order.date}</td>
                          <td className="px-4 py-3">{order.items.join(', ')}</td>
                          <td className="px-4 py-3 text-right">${order.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-md text-gray-600">
                You haven&apos;t placed any orders yet.
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div>
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Your Favorite Items</h2>
            
            {updateStatus.message && (
              <div className={`mb-4 p-3 rounded ${updateStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {updateStatus.message}
              </div>
            )}
            
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(item => (
                  <div key={item.id} className="bg-amber-50 p-4 rounded-md relative">
                    <button 
                      onClick={() => handleRemoveFavorite(item.id)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-amber-800"
                      aria-label="Remove from favorites"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center mr-3">
                        <Image src={item.image} alt={item.name} width={24} height={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                      <button className="text-amber-800 hover:text-amber-700 text-sm">
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-md text-gray-600">
                You don&apos;t have any favorite items yet.
              </div>
            )}
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <ProfileFetcherWithRenderProps>
      {(profile) => {
        // Update the lastProfile state when the profile changes
        if (profile && (!lastProfile || lastProfile.id !== profile.id)) {
          // Use setTimeout to avoid state updates during render
          setTimeout(() => setLastProfile(profile), 0);
        }
        
        // If not authenticated, redirect to auth page
        if (!profile && mounted) {
          // Use setTimeout to avoid state updates during render
          setTimeout(() => router.push('/auth'), 0);
          return (
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
              <Footer />
            </div>
          );
        }

        return (
          <div className="flex flex-col min-h-screen">
            <Navigation />
            
            <main className="flex-grow container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <header className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-amber-900">Your Profile</h1>
                      <p className="text-gray-600">Manage your account and preferences</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 border border-amber-800 text-amber-900 rounded-md hover:bg-amber-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </header>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                          activeTab === 'overview'
                            ? 'border-b-2 border-amber-800 text-amber-800'
                            : 'text-gray-600 hover:text-amber-800'
                        }`}
                      >
                        Account Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                          activeTab === 'orders'
                            ? 'border-b-2 border-amber-800 text-amber-800'
                            : 'text-gray-600 hover:text-amber-800'
                        }`}
                      >
                        Order History
                      </button>
                      <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                          activeTab === 'favorites'
                            ? 'border-b-2 border-amber-800 text-amber-800'
                            : 'text-gray-600 hover:text-amber-800'
                        }`}
                      >
                        Favorites
                      </button>
                    </nav>
                  </div>
                  
                  <div className="p-6">
                    {profile ? renderTabContent(profile) : (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
            
            <Footer />
          </div>
        );
      }}
    </ProfileFetcherWithRenderProps>
  );
}
