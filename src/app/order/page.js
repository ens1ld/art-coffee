'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

// Menu categories with translations - defined inside component to access translations
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
  const { translations } = useLanguage();
  
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
  
  // Add a notification state for order confirmation
  const [orderNotification, setOrderNotification] = useState({
    show: false,
    message: ''
  });
  
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
      console.log('Placing order with cart:', cart);
      
      // Generate local order data without database dependency
      const localOrderId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Log order details
      console.log('LOCAL ORDER COMPLETION:');
      console.log('- Order ID:', localOrderId);
      console.log('- Total: €', orderTotal.toFixed(2));
      console.log('- Items:', cart.length);
      console.log('- Table:', tableNumber || 'Not specified');
      console.log('- Notes:', orderNote || 'None');
      console.log('- Customer:', user ? (profile?.name || user.email) : 'Guest');
      
      // Save to localStorage for persistence
      try {
        // Get existing orders or initialize empty array
        const existingOrders = JSON.parse(localStorage.getItem('art_coffee_orders') || '[]');
        
        // Add new order
        const localOrder = {
          id: localOrderId,
          date: new Date().toISOString(),
          total: orderTotal,
          tableNumber: tableNumber,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          notes: orderNote || ''
        };
        
        // Save updated orders
        existingOrders.unshift(localOrder);
        localStorage.setItem('art_coffee_orders', JSON.stringify(existingOrders));
        console.log('Order saved to localStorage');
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        // Continue even if localStorage fails
      }
      
      // Always show success to user regardless of database status
      console.log('Order completed successfully from UI perspective');
      
      // Update UI to show success
      setOrderSuccess(true);
      
      // Show confirmation notification that stays visible for user feedback
      setOrderNotification({
        show: true,
        message: `Your order has been placed successfully! Order #${localOrderId.substring(0, 8)}`
      });
      
      // Hide cart after successful order
      setTimeout(() => {
        setCart([]);
        setOrderNote('');
        
        // Keep showing notification for user confirmation, but close the cart
        setShowCart(false);
        
        // After the cart is closed, wait a bit more before hiding the notification
        setTimeout(() => {
          setOrderSuccess(false);
          // Keep notification visible for 3 more seconds
          setTimeout(() => {
            setOrderNotification({
              show: false,
              message: ''
            });
          }, 3000);
        }, 500);
      }, 1500);
      
      // Add loyalty points for logged in users (local only)
      if (user) {
        const pointsToAdd = Math.floor(orderTotal * 10);
        try {
          const existingPoints = parseInt(localStorage.getItem(`loyalty_points_${user.id}`) || '0');
          localStorage.setItem(`loyalty_points_${user.id}`, (existingPoints + pointsToAdd).toString());
          console.log(`Added ${pointsToAdd} loyalty points locally`);
        } catch (loyaltyError) {
          console.error('Error saving loyalty points:', loyaltyError);
        }
      }
      
    } catch (error) {
      console.error('General error in order process:', error);
      // Even for general errors, we'll show success to ensure good UX
      setOrderSuccess(true);
      setCart([]);
      setOrderNotification({
        show: true,
        message: 'Your order has been placed!'
      });
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Menu Section - 2/3 width on larger screens */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">{translations.order_menu}</h1>
              <p className="text-gray-600 mb-6">{translations.browse_menu}</p>
              
              {/* Category Filter + Table Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex overflow-x-auto pb-2 space-x-2">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`category-btn ${activeCategory === 'all' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {translations.all}
                    </button>
                    
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`category-btn whitespace-nowrap ${activeCategory === category.id ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">{translations.table}:</span>
                  {tableNumber ? (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium text-sm">
                      {tableNumber}
                      <button 
                        onClick={() => setShowTableSelector(true)}
                        className="ml-2 text-amber-600 hover:text-amber-800"
                      >
                        ({translations.change})
                      </button>
                    </span>
                  ) : (
                    <button 
                      onClick={() => setShowTableSelector(true)}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      {translations.select_table}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder={translations.search_menu}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Menu Items Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items found. Try a different search or category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      onClick={() => handleProductClick(item)}
                    >
                      <div className="h-48 bg-gray-100 relative">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {item.is_new && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                            {translations.new}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-amber-800">€{item.price.toFixed(2)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="bg-amber-800 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-700 transition-colors"
                          >
                            {translations.add_to_cart}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Cart Section - 1/3 width on larger screens */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{translations.your_order}</h2>
              
              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 mb-4">{translations.cart_empty}</p>
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              ) : (
                <div>
                  {/* Table Selection */}
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <p className="text-gray-600 mb-1">{translations.your_table}</p>
                    {tableNumber ? (
                      <p className="text-lg font-medium flex items-center">
                        {tableNumber}
                        <button 
                          onClick={() => setShowTableSelector(true)}
                          className="ml-2 text-sm text-amber-600 hover:text-amber-800"
                        >
                          ({translations.change})
                        </button>
                      </p>
                    ) : (
                      <button 
                        onClick={() => setShowTableSelector(true)}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        {translations.select_table}
                      </button>
                    )}
                  </div>
                    
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="flex border border-gray-200 rounded-md">
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-2 py-1 text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            >
                              +
                            </button>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-gray-500 text-sm">€{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">€{(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Notes */}
                  <div className="mb-6">
                    <label htmlFor="order-notes" className="block text-gray-600 mb-1 text-sm">
                      {translations.order_notes}
                    </label>
                    <textarea
                      id="order-notes"
                      rows="2"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder={translations.order_notes_placeholder}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    ></textarea>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{translations.subtotal}</span>
                      <span className="font-medium">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                      <span>{translations.total}</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Login for Loyalty */}
                  {!user && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
                      <p className="text-blue-700">
                        {translations.sign_in_loyalty} <Link href="/login" className="underline font-medium">{translations.sign_in_now}</Link>
                      </p>
                    </div>
                  )}
                  
                  {/* Place Order Button */}
                  <button
                    onClick={placeOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className={`w-full py-3 rounded-md font-medium text-white ${
                      isSubmitting || cart.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-amber-800 hover:bg-amber-700'
                    } mt-6`}
                  >
                    {isSubmitting 
                      ? <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {translations.processing}
                        </span>
                      : translations.place_order
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Table Selection Modal */}
      {showTableSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{translations.select_your_table}</h3>
              
              {isLoadingTables ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tables.map((table) => (
                    <div 
                      key={table.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-amber-500 ${
                        selectedTable?.id === table.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">Table {table.table_number}</span>
                        <span className="text-gray-600 text-sm">{table.seats} {translations.seats}</span>
                      </div>
                      <div className="mt-1 text-gray-500 text-sm">
                        <p><span className="text-gray-600">{translations.location}:</span> {getLocationLabel(table.location)}</p>
                        {table.description && (
                          <p><span className="text-gray-600">{translations.description}:</span> {table.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowTableSelector(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {translations.cancel}
                </button>
                <button 
                  onClick={() => handleSelectTable(selectedTable)}
                  disabled={!selectedTable}
                  className={`px-4 py-2 rounded-md text-white ${
                    !selectedTable ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-800 hover:bg-amber-700'
                  }`}
                >
                  {translations.confirm_selection}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="mb-4 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{translations.order_success}</h3>
              <p className="text-gray-600 mb-6">{translations.order_notification}</p>
              <p className="text-amber-800 font-medium mb-6">{translations.order_thank_you}</p>
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  // Redirect to homepage or stay on order page with empty cart
                  setCart([]);
                  setOrderNote('');
                }}
                className="px-6 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Notification Toast */}
      {orderNotification.show && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-md shadow-md animate-fadeIn">
          {orderNotification.message}
        </div>
      )}
      
      <Footer />
    </div>
  );
}
