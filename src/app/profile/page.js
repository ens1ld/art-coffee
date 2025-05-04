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
  const [activeTab, setActiveTab] = useState('account');
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const { user, profile, loading, error, refreshProfile, signOut } = useProfile();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: 'user',
    approved: false,
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState({
    orders: true,
    loyalty: true,
    giftCards: true
  });

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

  // Fetch user profile once authentication status is known
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        role: profile?.role || 'user',
        approved: profile?.approved,
      });
    }
  }, [user, profile]);

  // Fetch loyalty points
  useEffect(() => {
    async function fetchLoyaltyData() {
      if (!user) return;
      
      try {
        // Fetch loyalty transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (transactionsError) throw transactionsError;
        
        // Calculate total points
        let totalPoints = 0;
        
        // Use placeholders if no data
        if (!transactions || transactions.length === 0) {
          // Create placeholder transactions
          const placeholderTransactions = [
            {
              id: 'placeholder-1',
              points: 150,
              transaction_type: 'earn',
              description: 'Order #123456',
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'placeholder-2',
              points: 75,
              transaction_type: 'earn',
              description: 'Order #789012',
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'placeholder-3',
              points: -100,
              transaction_type: 'redeem',
              description: 'Free Coffee Reward',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          setLoyaltyTransactions(placeholderTransactions);
          totalPoints = 125; // Placeholder total
        } else {
          setLoyaltyTransactions(transactions);
          
          // Calculate real total
          totalPoints = transactions.reduce((sum, transaction) => sum + transaction.points, 0);
        }
        
        setLoyaltyPoints(totalPoints);
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, loyalty: false }));
      }
    }
    
    fetchLoyaltyData();
  }, [user]);

  // Fetch gift cards
  useEffect(() => {
    async function fetchGiftCards() {
      if (!user) return;
      
      try {
        // Fetch gift cards sent or received
        const { data, error } = await supabase
          .from('gift_cards')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_email.eq.${user.email}`)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Use placeholders if no data
        if (!data || data.length === 0) {
          const placeholderGiftCards = [
            {
              id: 'placeholder-1',
              code: 'GIFT123',
              amount: 25,
              balance: 25,
              sender_id: null,
              recipient_email: user.email,
              recipient_name: 'You',
              is_redeemed: false,
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'placeholder-2',
              code: 'SENT456',
              amount: 15,
              balance: 0,
              sender_id: user.id,
              recipient_email: 'friend@example.com',
              recipient_name: 'Friend',
              is_redeemed: true,
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          setGiftCards(placeholderGiftCards);
        } else {
          setGiftCards(data);
        }
      } catch (error) {
        console.error('Error fetching gift cards:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, giftCards: false }));
      }
    }
    
    fetchGiftCards();
  }, [user]);

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
      await signOut();
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

  // Helper function to get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
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
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Navigation />
      
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-800">
                    {profileData.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <h1 className="text-xl font-bold text-amber-900">{profileData.name || 'User'}</h1>
                  <p className="text-gray-600">{profileData.email}</p>
                  
                  {/* Role Badge */}
                  <div className={`inline-block mt-2 px-3 py-1 rounded-full border ${getRoleBadgeColor(profileData.role)}`}>
                    {profileData.role || 'user'}
                    {profileData.role === 'admin' && !profileData.approved && (
                      <span className="ml-1 text-xs">(pending approval)</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link 
                    href="/profile" 
                    className="block w-full py-2 text-center rounded-md bg-amber-800 text-white hover:bg-amber-700"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/order" 
                    className="block w-full py-2 text-center rounded-md border border-amber-800 text-amber-800 hover:bg-amber-50"
                  >
                    My Orders
                  </Link>
                  
                  {/* Admin/Superadmin Links */}
                  {(profileData.role === 'admin' && profileData.approved) || profileData.role === 'superadmin' ? (
                    <Link 
                      href="/admin" 
                      className="block w-full py-2 text-center rounded-md border border-amber-800 text-amber-800 hover:bg-amber-50"
                    >
                      Admin Dashboard
                    </Link>
                  ) : null}
                  
                  {profileData.role === 'superadmin' && (
                    <Link 
                      href="/superadmin" 
                      className="block w-full py-2 text-center rounded-md border border-amber-800 text-amber-800 hover:bg-amber-50"
                    >
                      Superadmin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="block w-full py-2 text-center rounded-md border border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-amber-900 mb-4">Account Information</h2>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Full Name</p>
                  <p className="font-medium">{profileData.name || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Email Address</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Account Type</p>
                  <p className="font-medium capitalize">{profileData.role || 'User'}</p>
                  {profileData.role === 'admin' && !profileData.approved && (
                    <p className="text-amber-600 text-sm mt-1">
                      Your admin account is pending approval. You will be notified when it&apos;s approved.
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Member Since</p>
                  <p className="font-medium">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {/* Access Information */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-amber-900 mb-4">Access Information</h2>
                
                {profileData.role === 'user' && (
                  <div className="mb-4">
                    <p className="mb-2">
                      You currently have regular user access which allows you to:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Place coffee orders</li>
                      <li>Purchase gift cards</li>
                      <li>Participate in our loyalty program</li>
                      <li>View your order history</li>
                    </ul>
                  </div>
                )}
                
                {profileData.role === 'admin' && (
                  <div className="mb-4">
                    <p className="mb-2">
                      {profileData.approved 
                        ? 'You have admin access which allows you to:' 
                        : 'Once approved, you will have admin access to:'}
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>View all customer orders</li>
                      <li>Manage products and inventory</li>
                      <li>View loyalty program analytics</li>
                      <li>Access the admin dashboard</li>
                    </ul>
                  </div>
                )}
                
                {profileData.role === 'superadmin' && (
                  <div className="mb-4">
                    <p className="mb-2">
                      You have superadmin access which allows you to:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Manage all user accounts</li>
                      <li>Approve admin account requests</li>
                      <li>Access all system settings</li>
                      <li>View all admin and customer data</li>
                      <li>Complete access to the admin dashboard</li>
                    </ul>
                  </div>
                )}
                
                {profileData.role === 'user' && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-md">
                    <p className="text-amber-800 font-medium mb-2">
                      Want to become an admin?
                    </p>
                    <p className="text-gray-600 mb-4">
                      If you&apos;d like to request admin access, please contact us or create a new account with admin privileges.
                    </p>
                    <Link 
                      href="/contact" 
                      className="inline-block px-4 py-2 rounded-md bg-amber-800 text-white hover:bg-amber-700"
                    >
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
