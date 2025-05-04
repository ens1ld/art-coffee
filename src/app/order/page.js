'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Menu categories
const CATEGORIES = [
  { id: 'coffee', name: 'Coffee', icon: '☕' },
  { id: 'tea', name: 'Tea', icon: '🍵' },
  { id: 'pastries', name: 'Pastries', icon: '🥐' },
  { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
  { id: 'lunch', name: 'Lunch', icon: '🥪' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' }
];

export default function OrderPage() {
  const { user, profile } = useProfile();
  const router = useRouter();
  
  // State for menu and cart
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('coffee');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  
  // Order summary
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // QR code scanning
  const [scannedTable, setScannedTable] = useState(null);
  
  // Table selection
  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  
  // Check for table param in URL (from QR code)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const table = urlParams.get('table');
      if (table) {
        setTableNumber(table);
        setScannedTable(table);
      }
    }
  }, []);
  
  // Calculate totals when cart changes
  useEffect(() => {
    const calculatedSubtotal = cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal); // For now, no additional fees
  }, [cart]);
  
  // Fetch tables when table selector is shown
  useEffect(() => {
    async function fetchTables() {
      if (!showTableSelector) return;
      
      try {
        setIsLoadingTables(true);
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .order('table_number', { ascending: true });

        if (error) throw error;

        // Placeholder data if no tables
        if (!data || data.length === 0) {
          const placeholderTables = Array(12).fill(null).map((_, i) => ({
            id: `placeholder-${i}`,
            table_number: i + 1,
            description: i < 6 ? 'Window table' : i < 10 ? 'Center table' : 'Bar seating',
            seats: i < 6 ? 4 : i < 10 ? 6 : 2,
            location: i < 8 ? 'main' : i < 10 ? 'terrace' : 'bar',
            qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://art-coffee.vercel.app/order?table=${i + 1}`,
            created_at: new Date().toISOString()
          }));
          setTables(placeholderTables);
        } else {
          setTables(data);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setIsLoadingTables(false);
      }
    }

    fetchTables();
  }, [showTableSelector]);
  
  // Get location label for table
  const getLocationLabel = (location) => {
    switch (location) {
      case 'main':
        return 'Main Area';
      case 'terrace':
        return 'Terrace';
      case 'bar':
        return 'Bar Area';
      default:
        return location;
    }
  };
  
  // Handle table selection
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setTableNumber(table.table_number.toString());
    setShowTableSelector(false);
  };
  
  // Fetch menu items
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_out_of_stock', false)
          .order('name');

        if (error) throw error;

        // Placeholder data if no menu items
        if (!data || data.length === 0) {
          const placeholderItems = [
            {
              id: 'coffee-1',
              name: 'Espresso',
              description: 'Single shot of our signature espresso blend',
              price: 2.5,
              category: 'coffee',
              image_url: '/images/espresso.png',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'coffee-2',
              name: 'Cappuccino',
              description: 'Espresso with steamed milk and foam',
              price: 3.8,
              category: 'coffee',
              image_url: '/images/7.png',
              is_new: true,
              is_out_of_stock: false
            },
            {
              id: 'coffee-3',
              name: 'Latte',
              description: 'Espresso with a lot of steamed milk and a little foam',
              price: 4.2,
              category: 'coffee',
              image_url: '/images/8.png',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'tea-1',
              name: 'Earl Grey',
              description: 'Classic black tea with bergamot',
              price: 2.8,
              category: 'tea',
              image_url: '/images/earl-grey.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'tea-2',
              name: 'Green Tea',
              description: 'Delicate green tea with light floral notes',
              price: 2.8,
              category: 'tea',
              image_url: '/images/green-tea.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'pastry-1',
              name: 'Croissant',
              description: 'Buttery, flaky pastry',
              price: 2.5,
              category: 'pastries',
              image_url: '/images/croissant.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'pastry-2',
              name: 'Pain au Chocolat',
              description: 'Chocolate-filled pastry',
              price: 3.2,
              category: 'pastries',
              image_url: '/images/pain-au-chocolat.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'breakfast-1',
              name: 'Avocado Toast',
              description: 'Smashed avocado on toasted sourdough bread',
              price: 8.5,
              category: 'breakfast',
              image_url: '/images/avocado-toast.jpg',
              is_new: true,
              is_out_of_stock: false
            },
            {
              id: 'lunch-1',
              name: 'Caprese Sandwich',
              description: 'Fresh mozzarella, tomato, and basil on ciabatta',
              price: 9.5,
              category: 'lunch',
              image_url: '/images/caprese-sandwich.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'dessert-1',
              name: 'Chocolate Cake',
              description: 'Rich chocolate cake with ganache frosting',
              price: 5.5,
              category: 'desserts',
              image_url: '/images/chocolate-cake.jpg',
              is_new: false,
              is_out_of_stock: false
            }
          ];
          setMenuItems(placeholderItems);
          filterMenuItems(placeholderItems, activeCategory, searchQuery);
        } else {
          setMenuItems(data);
          filterMenuItems(data, activeCategory, searchQuery);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenuItems();
  }, []);
  
  // Filter menu items when category or search changes
  const filterMenuItems = (items, category, query) => {
    let filtered = items;
    
    // Apply category filter - case insensitive
    if (category !== 'all') {
      filtered = filtered.filter(item => 
        item.category && item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredItems(filtered);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    filterMenuItems(menuItems, categoryId, searchQuery);
  };
  
  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterMenuItems(menuItems, activeCategory, query);
  };
  
  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // Increment quantity if already in cart
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      // Add new item with quantity 1
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    // Record this product view/selection in cookies for recommendations
    if (typeof document !== 'undefined') {
      try {
        // Get existing viewed products from cookies
        const cookies = document.cookie.split(';');
        const viewedProductsCookie = cookies.find(cookie => cookie.trim().startsWith('viewed_products='));
        
        let viewedProducts = [];
        if (viewedProductsCookie) {
          viewedProducts = JSON.parse(decodeURIComponent(viewedProductsCookie.split('=')[1]));
        }
        
        // Add current product if not already in list
        if (!viewedProducts.includes(item.id)) {
          viewedProducts.unshift(item.id); // Add to front of array
          
          // Limit to last 10 viewed products
          if (viewedProducts.length > 10) {
            viewedProducts = viewedProducts.slice(0, 10);
          }
          
          // Save back to cookie with 30-day expiration
          document.cookie = `viewed_products=${encodeURIComponent(JSON.stringify(viewedProducts))};path=/;max-age=2592000`;
        }
      } catch (e) {
        console.error('Error updating viewed products cookie:', e);
        // Non-critical error, continue with cart update
      }
    }
    
    // Show a quick animation or notification
    const element = document.getElementById(`menu-item-${item.id}`);
    if (element) {
      element.classList.add('bg-green-50');
      setTimeout(() => {
        element.classList.remove('bg-green-50');
      }, 300);
    }
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      // Update quantity
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };
  
  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Create order items
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: ''
      }));
      
      // Create order
      const orderData = {
        user_id: user?.id || null,
        status: 'pending',
        total: total,
        table_number: tableNumber ? parseInt(tableNumber) : null,
        customer_name: user ? (profile?.name || user.email) : 'Guest',
        notes: orderNote
      };
      
      // In a real app, this would save to the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      
      if (orderError) throw orderError;
      
      // Add order items
      if (order) {
        const orderItemsWithOrderId = orderItems.map(item => ({
          ...item,
          order_id: order[0].id
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
          .insert(orderItemsWithOrderId);
      
      if (itemsError) throw itemsError;
      }
      
      // Add loyalty points if user is logged in
      if (user) {
        const pointsToAdd = Math.floor(total * 10); // 10 points per Euro
        
        const { error: loyaltyError } = await supabase
          .from('loyalty_transactions')
          .insert([{
            user_id: user.id,
            points: pointsToAdd,
            transaction_type: 'earn',
            reference_id: order ? order[0].id : null,
            description: `Order #${order ? order[0].id.toString().slice(0, 8) : 'test'}`
          }]);
          
        if (loyaltyError) {
          console.error('Error adding loyalty points:', loyaltyError);
          // Continue with order success even if loyalty points fail
        }
      }
      
      // Show success and reset cart
      setOrderSuccess(true);
      setCart([]);
      setOrderNote('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setOrderSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Record a product view in cookies (for recommendations)
  const recordProductView = (productId) => {
    if (typeof document === 'undefined' || !productId) return;
    
    try {
      // Get existing viewed products from cookies
      const cookies = document.cookie.split(';');
      const viewedProductsCookie = cookies.find(cookie => cookie.trim().startsWith('viewed_products='));
      
      let viewedProducts = [];
      if (viewedProductsCookie) {
        viewedProducts = JSON.parse(decodeURIComponent(viewedProductsCookie.split('=')[1]));
      }
      
      // Add current product if not already in list
      if (!viewedProducts.includes(productId)) {
        viewedProducts.unshift(productId); // Add to front of array
        
        // Limit to last 10 viewed products
        if (viewedProducts.length > 10) {
          viewedProducts = viewedProducts.slice(0, 10);
        }
        
        // Save back to cookie with 30-day expiration
        document.cookie = `viewed_products=${encodeURIComponent(JSON.stringify(viewedProducts))};path=/;max-age=2592000`;
      }
    } catch (e) {
      console.error('Error updating viewed products cookie:', e);
    }
  };

  // Handle product card click
  const handleProductClick = (item) => {
    recordProductView(item.id);
    // You could add additional functionality here like showing a modal with product details
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Order Menu</h1>
            <p className="text-gray-600">Browse our menu and place your order</p>
          </div>
          
          {scannedTable && (
            <div className="mt-2 md:mt-0 bg-amber-100 rounded-lg px-4 py-2">
              <span className="font-medium text-amber-800">Table #{scannedTable}</span>
          </div>
        )}

                  <button 
            onClick={() => setShowCart(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-amber-800 text-white hover:bg-amber-700"
                  >
            <span className="mr-2">{cart.length}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
            </svg>
                  </button>
                </div>
                
        {/* Category Navigation */}
        <div className="bg-white shadow rounded-lg p-2 mb-6 overflow-x-auto">
          <div className="flex space-x-2">
                        <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeCategory === 'all'
                  ? 'bg-amber-800 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              All
                        </button>
            
            {CATEGORIES.map((category) => (
                        <button
                key={category.id}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-amber-800 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={handleSearch}
          />
                  </div>
                  
        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            Array(6).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No menu items found matching your search.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                id={`menu-item-${item.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-colors cursor-pointer"
                onClick={() => handleProductClick(item)}
              >
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {item.is_new && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                      NEW
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-amber-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 h-12 overflow-hidden">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-amber-900">€{item.price.toFixed(2)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                        addToCart(item);
                          }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700"
                        >
                      Add to Cart
            </button>
          </div>
                </div>
              </div>
            ))
            )}
          </div>
          
        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40 flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-amber-900">Your Order</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4">
              {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4 text-gray-500">Your cart is empty</p>
                  <button
                      onClick={() => setShowCart(false)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700"
                  >
                      Browse Menu
                  </button>
                </div>
              ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex border-b border-gray-200 pb-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                          </div>
                            )}
                          </div>
                        
                        <div className="ml-4 flex-grow">
                          <h4 className="text-sm font-medium text-amber-900">{item.name}</h4>
                          <p className="text-gray-500 text-sm">€{item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartItemQuantity(item.id, item.quantity - 1);
                            }}
                            className="text-gray-500 hover:text-amber-800"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="mx-2 text-gray-700">{item.quantity}</span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartItemQuantity(item.id, item.quantity + 1);
                            }}
                            className="text-gray-500 hover:text-amber-800"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
          </div>
        ))}
                    
                    {/* Table Number Input */}
                    {!scannedTable && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Table
                        </label>
                        
                        {tableNumber ? (
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-300">
                            <div>
                              <span className="text-amber-800 font-medium">Table #{tableNumber}</span>
                              {selectedTable && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {getLocationLabel(selectedTable.location)}
                                  {selectedTable.description && ` • ${selectedTable.description}`}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowTableSelector(true)}
                              className="text-amber-800 hover:text-amber-900 text-sm"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowTableSelector(true)}
                            className="w-full flex justify-center py-2 px-4 border border-amber-800 rounded-md shadow-sm text-sm font-medium text-amber-800 bg-white hover:bg-amber-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Select Table
                          </button>
                        )}
      </div>
                    )}
                    
                    {/* Order Note */}
                    <div className="mt-4">
                      <label htmlFor="order-note" className="block text-sm font-medium text-gray-700">
                        Order Notes (optional)
                      </label>
                      <textarea
                        id="order-note"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Special instructions for your order..."
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  
                  {!user && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                      <p className="mb-2">Sign in to earn loyalty points with your purchase!</p>
                      <Link href="/login" className="text-amber-800 font-medium hover:underline">
                        Sign in now
                      </Link>
                    </div>
                  )}
                  
                  {orderSuccess && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                      Order placed successfully! You will be notified when your order is ready.
                      </div>
                    )}
                    
                      <button 
                    onClick={placeOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className={`mt-4 w-full py-3 px-4 rounded-md shadow-sm text-white font-medium ${
                      isSubmitting || cart.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-amber-800 hover:bg-amber-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Table Selection Modal */}
        {showTableSelector && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-amber-900">Select Your Table</h2>
                <button
                  onClick={() => setShowTableSelector(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                      </button>
              </div>
              
              <div className="p-4 flex-grow overflow-y-auto">
                {isLoadingTables ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table) => (
                      <div 
                        key={table.id} 
                        className={`bg-white border ${selectedTable?.id === table.id ? 'border-amber-500 ring-2 ring-amber-500' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-amber-500 transition-colors`}
                        onClick={() => handleSelectTable(table)}
                      >
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="text-lg font-medium text-amber-900">Table {table.table_number}</h3>
                          <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs">
                            {table.seats} Seats
                          </span>
                        </div>
                        
                        <div className="p-3">
                          <div className="flex justify-between mb-2">
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="text-sm font-medium">{getLocationLabel(table.location)}</p>
                            </div>
                            {table.description && (
                              <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-sm font-medium">{table.description}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="my-3 flex justify-center">
                            <img 
                              src={table.qr_code} 
                              alt={`QR Code for Table ${table.table_number}`} 
                              className="w-24 h-24 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTableSelector(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTable) {
                        setTableNumber(selectedTable.table_number.toString());
                        setShowTableSelector(false);
                      }
                    }}
                    disabled={!selectedTable}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                      selectedTable ? 'bg-amber-800 hover:bg-amber-700' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
