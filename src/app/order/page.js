'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProfile } from '@/components/ProfileFetcher';

export default function OrderPage() {
  // Default products that will be used if we can't fetch from database
  const defaultProducts = [
    {
      id: 1,
      name: 'Espresso',
      price: 3.50,
      description: 'Our signature espresso shot, rich and bold.',
      image: '/images/cards/6.png',
      category: 'Coffee',
    },
    {
      id: 2,
      name: 'Cappuccino',
      price: 4.50,
      description: 'Espresso with steamed milk and velvety foam.',
      image: '/images/cards/7.png',
      category: 'Coffee',
    },
    {
      id: 3,
      name: 'Latte',
      price: 4.75,
      description: 'Espresso with steamed milk and a light layer of foam.',
      image: '/images/cards/8.png',
      category: 'Coffee',
    },
    {
      id: 4,
      name: 'Americano',
      price: 4.00,
      description: 'Espresso diluted with hot water for a milder coffee.',
      image: '/images/cards/9.png',
      category: 'Coffee',
    },
    {
      id: 5,
      name: 'Mocha',
      price: 5.00,
      description: 'Espresso with chocolate and steamed milk.',
      image: '/images/cards/10.png',
      category: 'Coffee',
    },
    {
      id: 6,
      name: 'Cold Brew',
      price: 4.50,
      description: 'Coffee brewed with cold water for a smooth taste.',
      image: '/images/cards/11.png',
      category: 'Coffee',
    },
  ];

  const [products, setProducts] = useState(defaultProducts);
  const [cart, setCart] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [customization, setCustomization] = useState({
    size: 'medium',
    milk: 'whole',
    sugar: 'none',
    extras: [],
  });
  const [quantity, setQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState('');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });
  const { user: profileUser } = useProfile();
  const [loading, setLoading] = useState(true);

  // Try to fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id');
          
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Map database fields to match our product structure
          const mappedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            description: product.description,
            image: product.image_url || `/images/cards/${product.id}.png`, // Fallback image
            category: product.category || 'Coffee',
          }));
          
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // Keep using default products
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Guest users can browse the menu without logging in
    // Only set the user if available from profile context or session
    if (profileUser) {
      console.log('Using profile user in order page:', profileUser.email);
      setUser(profileUser);
      return;
    }
    
    // Optional check for Supabase session - no need to show loading UI for this
    const getUser = async () => {
      try {
        console.log('Fetching user directly in order page');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Error checking auth in order page:', err);
        // Continue as guest on error
      }
    };
    
    getUser();
  }, [profileUser]);

  // Load user's favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites({});
        return;
      }
      
      try {
        console.log('Loading favorites for user:', user.id);
        
        const { data, error } = await supabase
          .from('favorites')
          .select('id, product_id')
          .eq('user_id', user.id);
          
        if (error) {
          // If it's a 404, the table might not exist yet
          if (error.code === '404') {
            console.warn('Favorites table may not exist yet:', error);
          } else {
            console.error('Error loading favorites:', error);
          }
          setFavorites({});
          return;
        }
        
        // Create a map of product_id -> favorite.id for easy lookup
        const favMap = {};
        if (data) {
          data.forEach(fav => {
            favMap[fav.product_id] = fav.id;
          });
          console.log('Loaded favorites map:', favMap);
        }
        
        setFavorites(favMap);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setFavorites({});
      }
    };
    
    loadFavorites();
  }, [user]);

  const resetCustomization = () => {
    setCustomization({
      size: 'medium',
      milk: 'whole',
      sugar: 'none',
      extras: [],
    });
    setQuantity(1);
  };

  const handleSelectProduct = (product) => {
    setActiveProduct(product);
    resetCustomization();
  };

  const handleCustomizationChange = (field, value) => {
    if (field === 'extras') {
      // Toggle the extra from the array
      setCustomization(prev => {
        const currentExtras = [...prev.extras];
        const index = currentExtras.indexOf(value);
        
        if (index === -1) {
          currentExtras.push(value);
        } else {
          currentExtras.splice(index, 1);
        }
        
        return {
          ...prev,
          extras: currentExtras,
        };
      });
    } else {
      setCustomization(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const calculateItemPrice = () => {
    if (!activeProduct) return 0;
    
    let price = activeProduct.price;
    
    // Add for size
    if (customization.size === 'large') price += 1;
    if (customization.size === 'small') price -= 0.5;
    
    // Add for extras
    price += customization.extras.length * 0.75;
    
    return price * quantity;
  };

  const addToCart = () => {
    if (!activeProduct) return;
    
    const cartItem = {
      id: Date.now(),
      productId: activeProduct.id,
      name: activeProduct.name,
      customization: { ...customization },
      quantity,
      price: calculateItemPrice(),
      basePrice: calculateItemPrice() / quantity,
    };
    
    setCart(prev => [...prev, cartItem]);
    setActiveProduct(null);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!user) {
      console.log('No user found, showing login required message');
      setOrderStatus('login-required');
      return;
    }
    
    if (cart.length === 0) {
      return;
    }
    
    setOrderStatus('processing');
    
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: calculateTotalPrice(),
            status: 'pending',
          },
        ])
        .select();
      
      if (orderError) {
        // If orders table doesn't exist
        if (orderError.code === '404') {
          throw new Error('Orders table may not be set up yet');
        }
        throw orderError;
      }
      
      // Add order items
      const orderItems = cart.map(item => ({
        order_id: order[0].id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.basePrice,
        customization: item.customization,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        // If order_items table doesn't exist
        if (itemsError.code === '404') {
          throw new Error('Order items table may not be set up yet');
        }
        throw itemsError;
      }
      
      setOrderStatus('success');
      setCart([]);
    } catch (error) {
      console.error("Checkout error:", error);
      setOrderStatus('error');
    }
  };

  // Toggle favorite status of a product
  const toggleFavorite = async (productId) => {
    if (!user) {
      setNotification({
        message: 'Please log in to save favorites',
        type: 'error'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      
      return;
    }
    
    try {
      // If product is already favorited, delete the favorite
      if (favorites[productId]) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favorites[productId]);
          
        if (error) {
          // If favorites table doesn't exist
          if (error.code === '404') {
            setNotification({
              message: 'Favorites feature is not set up yet',
              type: 'error'
            });
            return;
          }
          throw error;
        }
        
        // Update local state
        const newFavorites = { ...favorites };
        delete newFavorites[productId];
        setFavorites(newFavorites);
        
        setNotification({
          message: 'Removed from favorites',
          type: 'success'
        });
      } 
      // Otherwise add a new favorite
      else {
        const { data, error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              product_id: productId
            }
          ])
          .select();
          
        if (error) {
          // If favorites table doesn't exist
          if (error.code === '404') {
            setNotification({
              message: 'Favorites feature is not set up yet',
              type: 'error'
            });
            return;
          }
          
          // If there's a data type mismatch
          if (error.code === '23502' || error.code === '22P02') {
            setNotification({
              message: 'There was an issue with the product ID format',
              type: 'error'
            });
            console.error('Product ID format error:', error);
            return;
          }
          
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error('No data returned from insert');
        }
        
        // Update local state
        setFavorites(prev => ({
          ...prev,
          [productId]: data[0].id
        }));
        
        setNotification({
          message: 'Added to favorites',
          type: 'success'
        });
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setNotification({
        message: 'Failed to update favorites',
        type: 'error'
      });
    }
  };

  // Sizing options
  const sizes = [
    { id: 'small', label: 'Small', modifier: '−$0.50' },
    { id: 'medium', label: 'Medium', modifier: '' },
    { id: 'large', label: 'Large', modifier: '+$1.00' },
  ];

  // Milk options
  const milkOptions = [
    { id: 'whole', label: 'Whole Milk' },
    { id: 'skim', label: 'Skim Milk' },
    { id: 'almond', label: 'Almond Milk' },
    { id: 'oat', label: 'Oat Milk' },
    { id: 'soy', label: 'Soy Milk' },
  ];

  // Sugar options
  const sugarOptions = [
    { id: 'none', label: 'No Sugar' },
    { id: 'light', label: 'Light Sugar' },
    { id: 'regular', label: 'Regular Sugar' },
    { id: 'extra', label: 'Extra Sugar' },
  ];

  // Extra options
  const extraOptions = [
    { id: 'whipped_cream', label: 'Whipped Cream', price: 0.75 },
    { id: 'extra_shot', label: 'Extra Espresso Shot', price: 0.75 },
    { id: 'vanilla_syrup', label: 'Vanilla Syrup', price: 0.75 },
    { id: 'caramel_syrup', label: 'Caramel Syrup', price: 0.75 },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-amber-900 mb-8 text-center">
          Order Your Perfect Coffee
        </h1>

        {/* Notification message */}
        {notification.message && (
          <div className={`fixed top-20 right-4 z-50 p-3 rounded-md shadow-md ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-serif font-semibold text-amber-800 mb-4">
              Menu
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-amber-50 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow relative"
                  onClick={() => handleSelectProduct(product)}
                >
                  {/* Favorite button */}
                  <button 
                    className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent product selection
                      toggleFavorite(product.id);
                    }}
                  >
                    {favorites[product.id] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-600">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )}
                  </button>

                  <div className="h-36 rounded-md overflow-hidden relative mb-3">
                    <Image 
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <h3 className="font-semibold text-amber-900">{product.name}</h3>
                  
                  <div className="flex justify-between items-center mt-1 mb-2">
                    <span className="text-primary font-semibold">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{product.category}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            {activeProduct ? (
              <div className="bg-amber-50 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-serif font-semibold text-amber-800 mb-4">
                  Customize Your {activeProduct.name}
                </h2>
                
                {/* Product Image */}
                <div className="h-48 rounded-md overflow-hidden relative mb-4">
                  <Image 
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Size Selection */}
                <div className="mb-6">
                  <h3 className="font-medium text-amber-900 mb-2">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        className={`px-4 py-2 rounded-full text-sm flex-1 ${
                          customization.size === size.id
                            ? 'bg-amber-800 text-white'
                            : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
                        }`}
                        onClick={() => handleCustomizationChange('size', size.id)}
                      >
                        {size.label}
                        {size.modifier && (
                          <span className="ml-1 text-xs opacity-75">{size.modifier}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Milk Selection */}
                <div className="mb-6">
                  <h3 className="font-medium text-amber-900 mb-2">Milk</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {milkOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`px-3 py-2 rounded-md text-sm ${
                          customization.milk === option.id
                            ? 'bg-amber-800 text-white'
                            : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
                        }`}
                        onClick={() => handleCustomizationChange('milk', option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sugar Selection */}
                <div className="mb-6">
                  <h3 className="font-medium text-amber-900 mb-2">Sugar</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sugarOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`px-3 py-2 rounded-md text-sm ${
                          customization.sugar === option.id
                            ? 'bg-amber-800 text-white'
                            : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
                        }`}
                        onClick={() => handleCustomizationChange('sugar', option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Extras Selection */}
                <div className="mb-6">
                  <h3 className="font-medium text-amber-900 mb-2">Extras (+$0.75 each)</h3>
                  <div className="space-y-2">
                    {extraOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={customization.extras.includes(option.id)}
                          onChange={() => handleCustomizationChange('extras', option.id)}
                          className="w-4 h-4 text-amber-600 bg-gray-100 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Quantity Selection */}
                <div className="mb-6">
                  <h3 className="font-medium text-amber-900 mb-2">Quantity</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-white border border-amber-300 text-amber-800 flex items-center justify-center hover:bg-amber-100"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    >
                      <span className="sr-only">Decrease</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="text-lg font-medium text-gray-800 w-8 text-center">
                      {quantity}
                    </span>
                    
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-white border border-amber-300 text-amber-800 flex items-center justify-center hover:bg-amber-100"
                      onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                    >
                      <span className="sr-only">Increase</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="ml-2 text-xl font-semibold text-amber-900">
                      ${calculateItemPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                    onClick={addToCart}
                  >
                    Add to Cart
                  </button>
                </div>
                
                <button
                  type="button"
                  className="w-full text-amber-700 text-sm text-center mt-2"
                  onClick={() => setActiveProduct(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-serif font-semibold text-amber-800 mb-4">
                  Your Cart {cart.length > 0 && `(${cart.length})`}
                </h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <p className="text-sm text-gray-500">
                      Click on a product to start ordering
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-amber-200 mb-4">
                      {cart.map((item) => (
                        <div key={item.id} className="py-3">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-amber-900">{item.name}</h3>
                              <p className="text-xs text-gray-600">
                                {item.customization.size.charAt(0).toUpperCase() + item.customization.size.slice(1)}{' '}
                                • {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
                              </p>
                              <ul className="text-xs text-gray-500 mt-1">
                                <li>Milk: {item.customization.milk.charAt(0).toUpperCase() + item.customization.milk.slice(1)}</li>
                                <li>Sugar: {item.customization.sugar.charAt(0).toUpperCase() + item.customization.sugar.slice(1)}</li>
                                {item.customization.extras.length > 0 && (
                                  <li>
                                    Extras: {item.customization.extras.map(extra => 
                                      extra.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    ).join(', ')}
                                  </li>
                                )}
                              </ul>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                              <button
                                type="button"
                                className="text-xs text-red-600 hover:text-red-800 mt-2"
                                onClick={() => removeFromCart(item.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-amber-200 pt-4 mb-6">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="w-full py-3 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                      onClick={handleCheckout}
                    >
                      Checkout
                    </button>
                  </>
                )}
                
                {/* Order Status Messages */}
                {orderStatus === 'login-required' && (
                  <div className="mt-4 p-4 bg-amber-100 text-amber-800 rounded-md">
                    <p className="text-sm font-medium">Please log in to complete your order</p>
                    <a 
                      href="/login?redirectTo=/order" 
                      className="text-amber-800 underline text-sm mt-2 inline-block"
                    >
                      Go to login
                    </a>
                  </div>
                )}
                
                {orderStatus === 'processing' && (
                  <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm font-medium">Processing your order...</p>
                  </div>
                )}
                
                {orderStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
                    <p className="text-sm font-medium">Your order has been placed successfully!</p>
                    <p className="text-xs mt-1">Thank you for ordering with Art Coffee.</p>
                  </div>
                )}
                
                {orderStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
                    <p className="text-sm font-medium">There was an error processing your order.</p>
                    <p className="text-xs mt-1">Please try again or contact support.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
