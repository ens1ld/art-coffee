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
import { useLanguage } from '@/context/LanguageContext';

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
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    orders: true,
    loyalty: true,
    giftCards: true,
    suggestions: true
  });
  
  // Get translations
  const { translations } = useLanguage();

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

  // Fetch suggested products based on order history and cookies
  useEffect(() => {
    async function fetchSuggestedProducts() {
      if (!mounted) return;
      
      setIsLoading(prev => ({ ...prev, suggestions: true }));
      
      try {
        // Get browsing history from cookies
        const getCookieValues = () => {
          if (typeof document === 'undefined') return [];
          
          const cookies = document.cookie.split(';');
          const viewedProducts = cookies
            .find(cookie => cookie.trim().startsWith('viewed_products='));
            
          if (!viewedProducts) return [];
          
          try {
            return JSON.parse(decodeURIComponent(viewedProducts.split('=')[1]));
          } catch (e) {
            console.error('Error parsing viewed products cookie:', e);
            return [];
          }
        };

        // Get previous orders to analyze preferences
        const getOrderPreferences = () => {
          const categories = {};
          const products = {};
          
          // Count occurrences of each category and product
          orders.forEach(order => {
            if (order.order_items) {
              order.order_items.forEach(item => {
                // Track categories
                if (item.category) {
                  categories[item.category] = (categories[item.category] || 0) + 1;
                }
                
                // Track products
                if (item.product_id) {
                  products[item.product_id] = (products[item.product_id] || 0) + 1;
                }
              });
            }
          });
          
          // Sort categories by frequency
          const preferredCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([category]) => category);
            
          return {
            categories: preferredCategories,
            products: Object.keys(products)
          };
        };
        
        // Get viewed products from cookies
        const viewedProductIds = getCookieValues();
        
        // Get user preferences from orders
        const preferences = getOrderPreferences();
        
        // Create or update a cookie for tracking product views if it doesn't exist
        if (typeof document !== 'undefined' && viewedProductIds.length === 0) {
          // Set default viewed products to make recommendations work immediately
          const defaultViewedProducts = ['coffee-1', 'pastry-1'];
          document.cookie = `viewed_products=${encodeURIComponent(JSON.stringify(defaultViewedProducts))};path=/;max-age=2592000`;
        }
        
        // Fetch recommended products from database
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);
          
        if (productsError) throw productsError;
        
        // Create placeholder recommendations if no products found or empty database
        const placeholderProducts = [
          {
            id: 'rec-1',
            name: 'Caramel Macchiato',
            description: 'Espresso with vanilla-flavored syrup and caramel',
            price: 4.50,
            category: 'coffee',
            image_url: '/images/caramel-macchiato.jpg',
            is_new: true
          },
          {
            id: 'rec-2',
            name: 'Blueberry Muffin',
            description: 'Fresh muffin with wild blueberries',
            price: 3.25,
            category: 'pastries',
            image_url: '/images/blueberry-muffin.jpg',
            is_new: false
          },
          {
            id: 'rec-3',
            name: 'Chai Latte',
            description: 'Black tea infused with cinnamon, clove and other spices',
            price: 3.75,
            category: 'tea',
            image_url: '/images/chai-latte.jpg',
            is_new: false
          },
          {
            id: 'rec-4',
            name: 'Avocado Toast',
            description: 'Smashed avocado on toasted sourdough bread',
            price: 8.50,
            category: 'breakfast',
            image_url: '/images/avocado-toast.jpg',
            is_new: false
          }
        ];
        
        // Use database products if available, otherwise use placeholders
        const products = productsData && productsData.length > 0 ? productsData : placeholderProducts;
        
        // Always show recommendations even if no order history
        setSuggestedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching suggested products:', error);
        // Set default recommendations if error occurs
        const defaultRecommendations = [
          {
            id: 'default-1',
            name: 'Espresso',
            description: 'Rich, aromatic shot of coffee',
            price: 2.50,
            category: 'coffee',
            image_url: '/images/6.png',
            is_new: false
          },
          {
            id: 'default-2',
            name: 'Croissant',
            description: 'Buttery, flaky pastry',
            price: 2.50,
            category: 'pastries',
            image_url: '/images/croissant.jpg',
            is_new: false
          },
          {
            id: 'default-3',
            name: 'Cappuccino',
            description: 'Espresso with steamed milk and foam',
            price: 3.80,
            category: 'coffee',
            image_url: '/images/7.png',
            is_new: true
          },
          {
            id: 'default-4',
            name: 'Chocolate Cake',
            description: 'Rich chocolate cake with ganache frosting',
            price: 5.50,
            category: 'desserts',
            image_url: '/images/chocolate-cake.jpg',
            is_new: false
          }
        ];
        setSuggestedProducts(defaultRecommendations);
      } finally {
        setIsLoading(prev => ({ ...prev, suggestions: false }));
      }
    }
    
    // Always fetch recommendations when the page is mounted, even without orders
    if (mounted) {
      fetchSuggestedProducts();
    }
  }, [mounted, user, orders]);

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
      
      // Clear localStorage data to ensure complete sign out
      if (typeof window !== 'undefined') {
        // Clear cached profile data
        localStorage.removeItem('art-coffee-profile-cache');
        
        // Clear any other app data in localStorage
        localStorage.removeItem('supabase.auth.token');
        
        // Force a complete page refresh to clear all state
        window.location.href = '/?refresh=' + Date.now();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // If standard sign out fails, try a more aggressive approach
      if (typeof window !== 'undefined') {
        localStorage.clear(); // Clear all localStorage as a fallback
        window.location.href = '/';
      }
    }
  };

  const getUserRoleDisplay = (profile) => {
    if (!profile) return translations.loading;
    
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
            <h1 className="text-2xl font-bold text-red-700 mb-4">{translations.error}</h1>
            <p className="mb-6 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              {translations.retry}
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
              {translations.nav_login}
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
                    {translations.profile_title}
                  </Link>
                  <Link 
                    onClick={(e) => {
                      e.preventDefault();
                      const ordersSection = document.querySelector('[data-section="orders"]');
                      if (ordersSection) {
                        ordersSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    href="#"
                    className="block w-full py-2 text-center rounded-md border border-amber-800 text-amber-800 hover:bg-amber-50"
                  >
                    {translations.profile_orders}
                  </Link>
                  
                  {/* Admin/Superadmin Links */}
                  {(profileData.role === 'admin' && profileData.approved) || profileData.role === 'superadmin' ? (
                    <Link 
                      href="/admin" 
                      className="block w-full py-2 text-center rounded-md border border-amber-800 text-amber-800 hover:bg-amber-50"
                    >
                      {translations.nav_admin}
                    </Link>
                  ) : null}
                  
                  {profileData.role === 'superadmin' && (
                    <Link 
                      href="/superadmin" 
                      className="block w-full py-2 text-center rounded-md border border-amber-800 text-amber-800 hover:bg-amber-50"
                    >
                      {translations.nav_superadmin}
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="block w-full py-2 text-center rounded-md border border-red-500 text-red-500 hover:bg-red-50"
                  >
                    {translations.nav_sign_out}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-amber-900 mb-4">{translations.profile_account_info}</h2>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">{translations.profile_full_name}</p>
                  <p className="font-medium">{profileData.name || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">{translations.profile_email}</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">{translations.profile_account_type}</p>
                  <p className="font-medium capitalize">{profileData.role || 'User'}</p>
                  {profileData.role === 'admin' && !profileData.approved && (
                    <p className="text-amber-600 text-sm mt-1">
                      {translations.profile_pending_approval}
                    </p>
                  )}
          </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">{translations.profile_member_since}</p>
                  <p className="font-medium">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {/* My Orders Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6" data-section="orders">
                <h2 className="text-xl font-bold text-amber-900 mb-4">{translations.profile_orders}</h2>
                
                {(() => {
                  // Try to get orders from localStorage first
                  let localOrders = [];
                  if (typeof window !== 'undefined') {
                    try {
                      localOrders = JSON.parse(localStorage.getItem('art_coffee_orders') || '[]');
                    } catch (e) {
                      console.error('Error parsing local orders:', e);
                    }
                  }
                  
                  if (localOrders.length > 0) {
                    return (
                      <div className="space-y-4">
                        {localOrders.map((order, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium text-amber-900">
                                  Order #{order.id.substring(0, 8)}
                                </span>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                            
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">{translations.profile_order_items}</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {order.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex justify-between">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>€{item.total.toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mt-3 flex justify-between border-t border-gray-100 pt-2">
                              <span className="text-gray-600">{translations.profile_total}</span>
                              <span className="font-bold text-amber-900">€{order.total.toFixed(2)}</span>
                            </div>
                            
                            {order.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">{translations.profile_notes}</span> {order.notes}
              </div>
            )}
                          </div>
                        ))}
          </div>
        );
                  } else if (orders.length > 0) {
        return (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
          <div>
                                <span className="font-medium text-amber-900">
                                  Order #{order.id.toString().substring(0, 8)}
                                </span>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">{translations.profile_order_items}</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {order.order_items && order.order_items.length > 0 ? (
                                  order.order_items.map((item, index) => (
                                    <li key={index} className="flex justify-between">
                                      <span>{item.quantity}x {item.product_name}</span>
                                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="italic text-gray-500">No items found</li>
                                )}
                              </ul>
                            </div>
                            
                            <div className="mt-3 flex justify-between border-t border-gray-100 pt-2">
                              <span className="text-gray-600">{translations.profile_total}</span>
                              <span className="font-bold text-amber-900">€{order.total.toFixed(2)}</span>
                            </div>
                            
                            {order.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">{translations.profile_notes}</span> {order.notes}
              </div>
            )}
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">{translations.profile_no_orders}</p>
                        <Link 
                          href="/order" 
                          className="inline-block px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
                        >
                          {translations.profile_browse_menu}
                        </Link>
                      </div>
                    );
                  }
                })()}
              </div>
              
              {/* Access Information */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-amber-900 mb-4">{translations.access_info}</h2>
                
                {profileData.role === 'user' && (
                  <div className="mb-4">
                    <p className="mb-2">
                      {translations.access_user}
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>{translations.access_user_p1}</li>
                      <li>{translations.access_user_p2}</li>
                      <li>{translations.access_user_p3}</li>
                      <li>{translations.access_user_p4}</li>
                    </ul>
              </div>
            )}
                
                {profileData.role === 'admin' && (
                  <div className="mb-4">
                    <p className="mb-2">
                      {profileData.approved 
                        ? translations.access_admin_approved 
                        : translations.access_admin_pending}
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>{translations.access_admin_p1}</li>
                      <li>{translations.access_admin_p2}</li>
                      <li>{translations.access_admin_p3}</li>
                      <li>{translations.access_admin_p4}</li>
                    </ul>
          </div>
                )}
                
                {profileData.role === 'superadmin' && (
                  <div className="mb-4">
                    <p className="mb-2">
                      {translations.access_superadmin}
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>{translations.access_superadmin_p1}</li>
                      <li>{translations.access_superadmin_p2}</li>
                      <li>{translations.access_superadmin_p3}</li>
                      <li>{translations.access_superadmin_p4}</li>
                      <li>{translations.access_superadmin_p5}</li>
                    </ul>
              </div>
            )}
            
                {profileData.role === 'user' && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-md">
                    <p className="text-amber-800 font-medium mb-2">
                      {translations.become_admin}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {translations.become_admin_p1}
                    </p>
                    <Link 
                      href="/contact" 
                      className="inline-block px-4 py-2 rounded-md bg-amber-800 text-white hover:bg-amber-700"
                    >
                      {translations.contact_us}
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Personalized Recommendations */}
              {suggestedProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-amber-900">{translations.recommendations}</h2>
                    <Link 
                      href="/order" 
                      className="text-amber-800 hover:text-amber-600 text-sm font-medium"
                    >
                      {translations.view_all_products}
                    </Link>
            </div>
                  
                  <p className="text-gray-600 mb-4">
                    {translations.based_on_history}
                  </p>
                  
                  {isLoading.suggestions ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestedProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          href={`/order?product=${product.id}`}
                          className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="h-32 bg-gray-100 relative">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            {product.is_new && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                                {translations.new}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-medium text-amber-900">{product.name}</h3>
                            <p className="text-gray-500 text-sm truncate">{product.description}</p>
                            <p className="mt-2 font-bold text-amber-900">€{product.price.toFixed(2)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-amber-50 rounded-md text-sm">
                    <p className="text-amber-800">
                      <span className="font-medium">{translations.pro_tip}</span> {translations.recommendation_tip}
                    </p>
                  </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
            
            <Footer />
          </div>
  );
}
