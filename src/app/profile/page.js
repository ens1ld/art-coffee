'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProfile } from '@/components/ProfileFetcher';

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Get user profile from context
  const { user, profile, loading, error } = useProfile();

  // Client-side only code
  useEffect(() => {
    setMounted(true);
    console.log("Profile page mounted, client-side rendering active");
  }, []);

  // Add more detailed logging for debugging
  useEffect(() => {
    if (mounted) {
      console.log("Auth state in profile page:", {
        loading,
        user: user ? `User ${user.id} (${user.email})` : 'No user',
        profile: profile ? `Profile with role ${profile.role}` : 'No profile',
        error: error || 'No error'
      });
    }
  }, [mounted, user, profile, loading, error]);

  // Only redirect to login when we're sure there's no user
  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log("No authenticated user found, redirecting to login");
      router.push('/login');
    }
  }, [mounted, loading, user, router]);

  // Handle role-based redirects
  useEffect(() => {
    if (!mounted || !profile) return;
    
    // Redirect based on role
    if (profile.role === 'admin' && !profile.approved) {
      router.push('/pending-approval');
    }
  }, [mounted, profile, router]);

  // Fetch user data (favorites and orders) when profile is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !profile) return;
      
      setLoadingData(true);
      try {
        // Fetch favorites from 'favorites' table if it exists
        try {
          console.log('Attempting to fetch favorites for user:', user.id);
          
          // First attempt to get just the favorites to check if table exists
          const { data: favoritesCheck, error: checkError } = await supabase
            .from('favorites')
            .select('id')
            .limit(1);
            
          if (checkError) {
            if (checkError.code === '404') {
              console.warn('Favorites table may not exist yet:', checkError);
              setFavorites([]);
            } else {
              console.error('Error checking favorites table:', checkError);
              setFavorites([]);
            }
          } else {
            // If favorites table exists, get user's favorites with product details
            const { data: favoritesData, error: favoritesError } = await supabase
              .from('favorites')
              .select(`
                id, 
                product_id,
                products:product_id (
                  id, 
                  name, 
                  price, 
                  category,
                  description,
                  image_url
                )
              `)
              .eq('user_id', user.id);
              
            if (favoritesError) {
              console.error('Error loading favorites with products:', favoritesError);
              setFavorites([]);
            } else {
              console.log('Successfully loaded favorites:', favoritesData?.length || 0);
              setFavorites(favoritesData || []);
            }
          }
        } catch (favError) {
          console.error('Exception loading favorites:', favError);
          setFavorites([]);
        }
        
        // Fetch orders
        try {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (ordersError) {
            // If table doesn't exist or other error
            if (ordersError.code === '404') {
              console.warn('Orders table may not exist yet');
            } else {
              console.error('Error loading orders:', ordersError);
            }
            // Set to empty array to avoid undefined errors
            setOrders([]);
          } else {
            setOrders(ordersData || []);
          }
        } catch (orderError) {
          console.error('Error loading orders:', orderError);
          // Set to empty array to avoid undefined errors
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set defaults to avoid rendering errors
        setFavorites([]);
        setOrders([]);
      } finally {
        setLoadingData(false);
      }
    };
    
    if (mounted && user && profile) {
      fetchUserData();
    }
  }, [mounted, user, profile]);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      console.log('Removing favorite:', favoriteId);
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
        
      if (error) {
        // If favorites table doesn't exist
        if (error.code === '404') {
          throw new Error('Favorites feature is not available right now');
        }
        console.error('Delete favorite error:', error);
        throw error;
      }
      
      // Update local state
      setFavorites(favorites.filter(item => item.id !== favoriteId));
      setUpdateStatus({
        message: 'Item removed from favorites',
        type: 'success'
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error removing favorite:', error);
      setUpdateStatus({
        message: error.message || 'Failed to remove favorite',
        type: 'error'
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setUpdateStatus({ message: '', type: '' });
      }, 5000);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
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

  // If still loading, show a loading spinner
  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // If there is an error loading the profile, show an error message
  if (error) {
    console.error('Profile page error:', error);
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Profile Error</h1>
            <p className="mb-6 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If no user or profile after loading is complete, show login message
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-800 mb-4">Authentication Required</h1>
            <p className="mb-6">Please log in to view your profile.</p>
            <Link href="/login" className="btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 bg-amber-50 p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-800">
                    {profile.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-900">My Profile</h1>
                  <p className="text-amber-700">{profile.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white border border-amber-800 text-amber-800 rounded-md hover:bg-amber-800 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
            
            {updateStatus.message && (
              <div className={`mt-4 p-3 rounded ${updateStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {updateStatus.message}
              </div>
            )}
          </div>
          
          <div className="mb-6 border-b border-amber-200">
            <nav className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-amber-800 text-amber-800 font-medium' : 'border-transparent text-gray-600 hover:text-amber-700'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'favorites' ? 'border-amber-800 text-amber-800 font-medium' : 'border-transparent text-gray-600 hover:text-amber-700'}`}
              >
                Favorites
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'orders' ? 'border-amber-800 text-amber-800 font-medium' : 'border-transparent text-gray-600 hover:text-amber-700'}`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'settings' ? 'border-amber-800 text-amber-800 font-medium' : 'border-transparent text-gray-600 hover:text-amber-700'}`}
              >
                Settings
              </button>
            </nav>
          </div>
          
          {activeTab === 'overview' && (
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

              <div>
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Profile Settings</h2>
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Created At</p>
                      <p className="font-medium">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Last Updated</p>
                      <p className="font-medium">
                        {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Recent Orders</h2>
                {loadingData ? (
                  <div className="bg-amber-50 p-4 rounded-md flex justify-center">
                    <div className="animate-pulse w-full">
                      <div className="h-8 bg-amber-200/50 mb-3 rounded"></div>
                      <div className="h-8 bg-amber-200/50 mb-3 rounded"></div>
                      <div className="h-8 bg-amber-200/50 rounded"></div>
                    </div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-amber-200">
                            <th className="px-4 py-2 text-left">Order ID</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 3).map(order => (
                            <tr key={order.id} className="border-b border-amber-100">
                              <td className="px-4 py-3">#{order.id.substring(0, 8)}</td>
                              <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right">${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</td>
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
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Favorite Items</h2>
                {loadingData ? (
                  <div className="bg-amber-50 p-4 rounded-md flex justify-center">
                    <div className="animate-pulse w-full">
                      <div className="h-8 bg-amber-200/50 mb-3 rounded"></div>
                      <div className="h-8 bg-amber-200/50 mb-3 rounded"></div>
                    </div>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="space-y-2">
                      {favorites.slice(0, 3).map(favorite => (
                        <div key={favorite.id} className="flex items-center justify-between border-b border-amber-100 pb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-amber-200 rounded-md mr-3 overflow-hidden relative">
                              {favorite.products?.image_url ? (
                                <Image
                                  src={favorite.products.image_url}
                                  alt={favorite.products.name || 'Coffee product'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-amber-800">
                                  ☕
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{favorite.products?.name || 'Coffee product'}</p>
                              <p className="text-xs text-gray-600">{favorite.products?.category || 'Coffee'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="text-amber-800 hover:text-amber-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        onClick={() => setActiveTab('favorites')}
                        className="text-amber-800 hover:text-amber-700 text-sm font-medium"
                      >
                        View all favorites →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-md text-gray-600">
                    You haven&apos;t added any favorites yet. Browse our products and click the heart icon to add favorites.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-4">Your Favorite Items</h2>
              {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-amber-50 p-4 rounded-md animate-pulse">
                      <div className="w-full h-40 bg-amber-200/50 rounded-md mb-4"></div>
                      <div className="h-6 bg-amber-200/50 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-amber-200/50 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(favorite => (
                    <div key={favorite.id} className="bg-amber-50 p-4 rounded-md shadow-sm">
                      <div className="w-full h-40 bg-amber-200 rounded-md mb-4 relative overflow-hidden">
                        {favorite.products?.image_url ? (
                          <Image
                            src={favorite.products.image_url}
                            alt={favorite.products.name || 'Coffee product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-amber-800 text-4xl">
                            ☕
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-amber-900 mb-1">{favorite.products?.name || 'Coffee product'}</h3>
                      <p className="text-sm text-gray-600 mb-3">{favorite.products?.category || 'Coffee'}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">${favorite.products?.price ? parseFloat(favorite.products.price).toFixed(2) : '0.00'}</span>
                        <div className="space-x-2">
                          <button 
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="px-3 py-1 border border-amber-800 text-amber-800 rounded hover:bg-amber-800 hover:text-white text-sm transition-colors"
                          >
                            Remove
                          </button>
                          <Link
                            href={`/order?product=${favorite.product_id}`}
                            className="px-3 py-1 bg-amber-800 text-white rounded hover:bg-amber-700 text-sm transition-colors"
                          >
                            Order
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 p-8 rounded-lg text-center">
                  <div className="mb-4 text-amber-800 text-5xl">☕</div>
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">No Favorites Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t added any products to your favorites list.
                    Browse our products and click the heart icon to add items you love.
                  </p>
                  <Link
                    href="/order"
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-4">Your Order History</h2>
              {loadingData ? (
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="animate-pulse w-full">
                    <div className="h-8 bg-amber-200/50 mb-3 rounded"></div>
                    <div className="h-8 bg-amber-200/50 mb-3 rounded"></div>
                    <div className="h-8 bg-amber-200/50 rounded"></div>
                  </div>
                </div>
              ) : orders.length > 0 ? (
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200">
                          <th className="px-4 py-2 text-left">Order ID</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          <th className="px-4 py-2 text-right">Status</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-amber-100">
                            <td className="px-4 py-3">#{order.id.substring(0, 8)}</td>
                            <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right">${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-amber-800 hover:text-amber-700 underline text-xs">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-8 rounded-lg text-center">
                  <div className="mb-4 text-amber-800 text-5xl">📦</div>
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t placed any orders yet.
                    Start your coffee journey by placing your first order!
                  </p>
                  <Link
                    href="/order"
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Place Your First Order
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-4">Account Settings</h2>
              <div className="bg-amber-50 p-6 rounded-lg">
                <div className="mb-6">
                  <h3 className="text-md font-medium text-amber-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notify-orders" 
                        className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="notify-orders" className="ml-2 text-gray-700">
                        Order Updates
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notify-promos" 
                        className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="notify-promos" className="ml-2 text-gray-700">
                        Promotions and Deals
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notify-news" 
                        className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="notify-news" className="ml-2 text-gray-700">
                        Art Coffee News
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium text-amber-900 mb-4">Security</h3>
                  <button className="px-4 py-2 bg-white border border-amber-800 text-amber-800 rounded hover:bg-amber-800 hover:text-white transition-colors">
                    Change Password
                  </button>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-amber-900 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="privacy-tracking" 
                        className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="privacy-tracking" className="ml-2 text-gray-700">
                        Allow order history tracking for recommendations
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
