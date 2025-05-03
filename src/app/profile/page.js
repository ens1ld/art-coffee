'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const { user, profile, loading, error } = useProfile();
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [preferences, setPreferences] = useState({
    favoriteProducts: [],
    dietaryPreferences: [],
    suggestedItems: []
  });

  // Mock data for orders and favorites until we connect to actual data
  useEffect(() => {
    if (user) {
      // Fetch favorites (simulated for now)
      setFavorites([
        { id: 'p1', name: 'Caramel Macchiato', image: '/logo.svg', price: 4.99, category: 'Coffee' },
        { id: 'p2', name: 'Blueberry Muffin', image: '/logo.svg', price: 3.49, category: 'Pastry' },
        { id: 'p3', name: 'Cold Brew', image: '/logo.svg', price: 4.49, category: 'Coffee' }
      ]);

      // Fetch recent orders (simulated for now)
      setOrders([
        { id: '1001', date: '2023-06-15', items: ['Caramel Macchiato', 'Blueberry Muffin'], total: 8.48, status: 'Completed' },
        { id: '1002', date: '2023-06-10', items: ['Cold Brew', 'Chocolate Croissant'], total: 7.98, status: 'Completed' },
        { id: '1003', date: '2023-05-28', items: ['Americano', 'Breakfast Sandwich'], total: 9.47, status: 'Completed' },
      ]);

      // Fetch/generate preferences (AI-suggested items based on order history)
      setPreferences({
        favoriteProducts: ['Caramel Macchiato', 'Cold Brew', 'Blueberry Muffin'],
        dietaryPreferences: ['Low sugar options', 'Dairy alternatives available'],
        suggestedItems: [
          { id: 's1', name: 'Vanilla Latte', reason: 'Based on your love for Caramel Macchiato' },
          { id: 's2', name: 'Nitro Cold Brew', reason: 'Since you enjoy our Cold Brew' },
          { id: 's3', name: 'Banana Bread', reason: 'Pairs well with your favorite coffee choices' }
        ]
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>Error loading profile: {error.message || 'Unknown error'}</p>
          </div>
          <p>Please try refreshing the page or sign out and sign back in.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Profile</h1>
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6">
            <p>You need to be logged in to view your profile.</p>
          </div>
          <a href="/auth" className="inline-block bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700">
            Login / Sign Up
          </a>
        </div>
      </div>
    );
  }

  const getUserRoleDisplay = () => {
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

  const handleRemoveFavorite = (itemId) => {
    // In a real implementation, this would call an API to remove from favorites
    setFavorites(favorites.filter(item => item.id !== itemId));
    setUpdateStatus({
      message: 'Item removed from favorites',
      type: 'success'
    });
  };

  const renderTabContent = () => {
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
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">User ID</p>
                    <p className="font-medium text-sm overflow-ellipsis overflow-hidden">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Type</p>
                    <p className="font-medium">{getUserRoleDisplay()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email Verified</p>
                    <p className="font-medium">{user.email_confirmed_at ? 'Yes' : 'No'}</p>
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
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Last Updated</p>
                      <p className="font-medium">
                        {new Date(profile.updated_at).toLocaleDateString()}
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-amber-800 mb-4">Account Actions</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
                      if (error) throw error;
                      setUpdateStatus({
                        message: 'Password reset email sent to your email address',
                        type: 'success',
                      });
                    } catch (error) {
                      setUpdateStatus({
                        message: `Error sending reset email: ${error.message}`,
                        type: 'error',
                      });
                    }
                  }}
                  className="px-4 py-2 border border-amber-800 text-amber-900 rounded-md hover:bg-amber-100 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Order History</h2>
            {orders.length > 0 ? (
              <div className="bg-white p-4 rounded-md shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50">
                        <th className="px-4 py-2 text-left">Order ID</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Items</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="px-4 py-3">{order.id}</td>
                          <td className="px-4 py-3">{order.date}</td>
                          <td className="px-4 py-3">{order.items.join(', ')}</td>
                          <td className="px-4 py-3 text-right">${order.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-amber-800 hover:text-amber-700">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-md shadow">
                <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
                <Link href="/order" className="inline-block bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700">
                  Place Your First Order
                </Link>
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Your Favorites</h2>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(item => (
                  <div key={item.id} className="bg-white rounded-md shadow overflow-hidden">
                    <div className="relative h-40 bg-amber-100">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full p-2"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleRemoveFavorite(item.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label="Remove from favorites"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            className="text-amber-800 hover:text-amber-700"
                            aria-label="Add to cart"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-md shadow">
                <p className="text-gray-600 mb-4">You don&apos;t have any favorites yet.</p>
                <Link href="/menu" className="inline-block bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700">
                  Browse Our Menu
                </Link>
              </div>
            )}
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Your Preferences</h2>
            
            <div className="bg-white p-6 rounded-md shadow">
              <h3 className="font-medium text-amber-900 mb-3">Favorite Products</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {preferences.favoriteProducts.map((product, index) => (
                  <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                    {product}
                  </span>
                ))}
              </div>
              
              <h3 className="font-medium text-amber-900 mb-3">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {preferences.dietaryPreferences.map((pref, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {pref}
                  </span>
                ))}
                <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:bg-gray-50">
                  + Add Preference
                </button>
              </div>
              
              <h3 className="font-medium text-amber-900 mb-3">AI-Suggested Recommendations</h3>
              <div className="space-y-3">
                {preferences.suggestedItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.reason}</p>
                    </div>
                    <button className="text-amber-800 hover:text-amber-700 text-sm px-3 py-1 border border-amber-800 rounded-md hover:bg-amber-50">
                      Try It
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-amber-900 mb-2">Your Profile</h1>
        <p className="text-gray-600 mb-6">Manage your account, orders, and preferences</p>
        
        {updateStatus.message && (
          <div className={`border-l-4 p-4 mb-6 ${
            updateStatus.type === 'success' 
              ? 'bg-green-100 border-green-500 text-green-700' 
              : 'bg-red-100 border-red-500 text-red-700'
          }`}>
            <p>{updateStatus.message}</p>
          </div>
        )}

        <div className="mb-8 border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`mr-6 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`mr-6 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`mr-6 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`mr-6 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
}
