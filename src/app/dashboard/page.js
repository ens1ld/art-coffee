'use client';

import { useState } from 'react';
import { useProfile } from '@/components/ProfileFetcher';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading, error } = useProfile();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for orders and loyalty
  const mockOrders = [
    { id: '1001', date: '2023-06-15', items: ['Latte', 'Croissant'], total: 12.50, status: 'Completed' },
    { id: '1002', date: '2023-06-10', items: ['Cappuccino', 'Blueberry Muffin'], total: 11.75, status: 'Completed' },
    { id: '1003', date: '2023-05-28', items: ['Americano', 'Chocolate Chip Cookie'], total: 8.25, status: 'Completed' },
  ];

  const loyaltyPoints = 275;
  const loyaltyLevel = 'Gold';
  const nextReward = 25;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Dashboard</h1>
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Dashboard</h1>
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Dashboard</h1>
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6">
            <p>You need to be logged in to view your dashboard.</p>
          </div>
          <Link href="/auth" className="inline-block bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700">
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Account Summary</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Email:</span> {user.email}</p>
                <p><span className="text-gray-600">Account Type:</span> {profile?.role === 'user' ? 'Customer' : profile?.role || 'Loading...'}</p>
                <p><span className="text-gray-600">Member Since:</span> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Loading...'}</p>
              </div>
              <div className="mt-4">
                <Link href="/profile" className="text-amber-800 hover:text-amber-700 font-medium">
                  Edit Profile →
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Loyalty Status</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Current Points:</span> {loyaltyPoints}</p>
                <p><span className="text-gray-600">Status Level:</span> {loyaltyLevel}</p>
                <p><span className="text-gray-600">Points to Next Reward:</span> {nextReward}</p>
              </div>
              <div className="mt-4">
                <Link href="/loyalty" className="text-amber-800 hover:text-amber-700 font-medium">
                  View Loyalty Program →
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Recent Orders</h3>
              {mockOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50">
                        <th className="px-4 py-2 text-left">Order ID</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Items</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrders.slice(0, 3).map(order => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No recent orders found.</p>
              )}
              <div className="mt-4">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-amber-800 hover:text-amber-700 font-medium"
                >
                  View All Orders →
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Order History</h3>
            {mockOrders.length > 0 ? (
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
                    {mockOrders.map(order => (
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
            ) : (
              <p className="text-gray-500">No orders found.</p>
            )}
          </div>
        );
      
      case 'loyalty':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Loyalty Program</h3>
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="w-1/3 text-gray-600">Current Points:</div>
                <div className="w-2/3 font-semibold text-lg">{loyaltyPoints}</div>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-1/3 text-gray-600">Status Level:</div>
                <div className="w-2/3">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-medium rounded-full">
                    {loyaltyLevel}
                  </span>
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-1/3 text-gray-600">Next Reward:</div>
                <div className="w-2/3">Free drink at {loyaltyPoints + nextReward} points</div>
              </div>
            </div>
            
            <h4 className="font-medium text-amber-800 mb-2">Point Progress</h4>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-amber-500 h-4 rounded-full" 
                  style={{ width: `${Math.min(100, (loyaltyPoints % 100))}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">
                {loyaltyPoints % 100}/100 to next reward
              </div>
            </div>
            
            <h4 className="font-medium text-amber-800 mb-2">Rewards History</h4>
            <div className="border rounded overflow-hidden">
              <div className="bg-amber-50 px-4 py-2 flex justify-between">
                <span>Date</span>
                <span>Reward</span>
              </div>
              <div className="divide-y">
                <div className="px-4 py-3 flex justify-between">
                  <span>May 15, 2023</span>
                  <span>Free Medium Drink</span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span>April 2, 2023</span>
                  <span>Free Pastry</span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span>March 20, 2023</span>
                  <span>Free Medium Drink</span>
                </div>
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome back, {user.email}</p>
        
        <div className="mb-6 border-b border-gray-200">
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
              onClick={() => setActiveTab('loyalty')}
              className={`mr-6 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loyalty'
                  ? 'border-amber-800 text-amber-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Loyalty Program
            </button>
          </nav>
        </div>
        
        {renderTabContent()}

        {/* Debug Section - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Debug Information</h2>
            <div className="bg-gray-100 p-4 rounded-md text-xs font-mono overflow-x-auto">
              <p>User ID: {user?.id || 'Not found'}</p>
              <p>Email: {user?.email || 'Not found'}</p>
              <p>Profile ID: {profile?.id || 'Not found'}</p>
              <p>Role: {profile?.role || 'Not found'}</p>
              <p>Approved: {profile?.approved ? 'Yes' : 'No'}</p>
              <p className="mt-2">Authentication State: {user ? 'Authenticated' : 'Not Authenticated'}</p>
              <p>Error: {error?.message || 'None'}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => console.log('Profile Context:', { user, profile, loading, error })}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
              >
                Log Data
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 