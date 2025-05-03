'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function OrderPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Espresso',
      price: 3.50,
      description: 'Our signature espresso shot, rich and bold.',
      image: '/images/espresso.jpg',
    },
    {
      id: 2,
      name: 'Cappuccino',
      price: 4.50,
      description: 'Espresso with steamed milk and velvety foam.',
      image: '/images/cappuccino.jpg',
    },
    {
      id: 3,
      name: 'Latte',
      price: 4.75,
      description: 'Espresso with steamed milk and a light layer of foam.',
      image: '/images/latte.jpg',
    },
    {
      id: 4,
      name: 'Americano',
      price: 4.00,
      description: 'Espresso diluted with hot water for a milder coffee.',
      image: '/images/americano.jpg',
    },
    {
      id: 5,
      name: 'Mocha',
      price: 5.00,
      description: 'Espresso with chocolate and steamed milk.',
      image: '/images/mocha.jpg',
    },
    {
      id: 6,
      name: 'Cold Brew',
      price: 4.50,
      description: 'Coffee brewed with cold water for a smooth taste.',
      image: '/images/cold-brew.jpg',
    },
  ]);

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

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
  }, []);

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
      
      if (orderError) throw orderError;
      
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
      
      if (itemsError) throw itemsError;
      
      setOrderStatus('success');
      setCart([]);
    } catch (error) {
      console.error('Checkout error:', error);
      setOrderStatus('error');
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
    { id: 'whipped_cream', label: 'Whipped Cream', price: '+$0.75' },
    { id: 'caramel', label: 'Caramel Syrup', price: '+$0.75' },
    { id: 'vanilla', label: 'Vanilla Syrup', price: '+$0.75' },
    { id: 'chocolate', label: 'Chocolate Syrup', price: '+$0.75' },
    { id: 'cinnamon', label: 'Cinnamon', price: '+$0.75' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <div className="container-custom py-12">
        <h1 className="heading-2 mb-8 text-center">Order Your Perfect Coffee</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {activeProduct ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-primary">
                    Customize Your {activeProduct.name}
                  </h2>
                  <button 
                    className="text-text-secondary hover:text-primary"
                    onClick={() => setActiveProduct(null)}
                  >
                    ← Back to Menu
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <Image
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-primary mb-2">
                      {activeProduct.name}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {activeProduct.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-primary font-semibold">
                        ${calculateItemPrice().toFixed(2)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => q + 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Size Selection */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">Size</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {sizes.map(size => (
                        <button
                          key={size.id}
                          onClick={() => handleCustomizationChange('size', size.id)}
                          className={`py-2 px-3 rounded-button border text-sm transition-colors ${
                            customization.size === size.id
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-border text-text-secondary hover:border-primary'
                          }`}
                        >
                          <div className="font-medium">{size.label}</div>
                          {size.modifier && (
                            <div className="text-xs opacity-90">
                              {size.modifier}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Milk Selection */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">Milk</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {milkOptions.map(milk => (
                        <button
                          key={milk.id}
                          onClick={() => handleCustomizationChange('milk', milk.id)}
                          className={`py-2 px-3 rounded-button border text-sm transition-colors ${
                            customization.milk === milk.id
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-border text-text-secondary hover:border-primary'
                          }`}
                        >
                          {milk.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sugar Selection */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">Sugar</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {sugarOptions.map(sugar => (
                        <button
                          key={sugar.id}
                          onClick={() => handleCustomizationChange('sugar', sugar.id)}
                          className={`py-2 px-3 rounded-button border text-sm transition-colors ${
                            customization.sugar === sugar.id
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-border text-text-secondary hover:border-primary'
                          }`}
                        >
                          {sugar.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Extras Selection */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">Extras</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {extraOptions.map(extra => (
                        <button
                          key={extra.id}
                          onClick={() => handleCustomizationChange('extras', extra.id)}
                          className={`py-2 px-3 rounded-button border text-sm transition-colors flex justify-between items-center ${
                            customization.extras.includes(extra.id)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-border text-text-secondary hover:border-primary'
                          }`}
                        >
                          <span>{extra.label}</span>
                          <span className="text-xs opacity-90">{extra.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={addToCart}
                    className="btn-primary w-full"
                  >
                    Add to Cart — ${calculateItemPrice().toFixed(2)}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-serif font-semibold text-primary mb-6">
                  Coffee Menu
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div 
                      key={product.id}
                      className="card hover:shadow-card-hover cursor-pointer transition-all"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-primary mb-1">
                        {product.name}
                      </h3>
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-semibold">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          className="text-xs btn-outline py-1 px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(product);
                          }}
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-xl font-serif font-semibold text-primary mb-6">
                Your Order
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-[#F9F5F0] rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-text-secondary mb-4">
                    Your cart is empty
                  </p>
                  {orderStatus === 'success' && (
                    <div className="p-3 bg-success/10 border border-success/30 rounded text-success text-sm mb-4">
                      Order placed successfully!
                    </div>
                  )}
                  {orderStatus === 'error' && (
                    <div className="p-3 bg-error/10 border border-error/30 rounded text-error text-sm mb-4">
                      Failed to place order. Please try again.
                    </div>
                  )}
                  <button
                    className="btn-outline"
                    onClick={() => setActiveProduct(products[0])}
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between border-b border-border pb-4">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-primary">
                              {item.name}
                            </span>
                            <span className="text-text-light text-sm ml-2">
                              × {item.quantity}
                            </span>
                          </div>
                          <div className="text-xs text-text-light mt-1">
                            <div>{item.customization.size}, {item.customization.milk} milk, {item.customization.sugar} sugar</div>
                            {item.customization.extras.length > 0 && (
                              <div>+ {item.customization.extras.join(', ').replace(/_/g, ' ')}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-primary">
                            ${item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-text-light hover:text-error"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-medium">${calculateTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tax</span>
                      <span className="font-medium">Included</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="text-lg font-medium text-primary">Total</span>
                      <span className="text-lg font-semibold text-primary">${calculateTotalPrice()}</span>
                    </div>
                    
                    {orderStatus === 'login-required' && (
                      <div className="p-3 bg-warning/10 border border-warning/30 rounded text-warning text-sm mb-4">
                        Please log in to complete your order
                      </div>
                    )}
                    
                    {orderStatus === 'processing' ? (
                      <button 
                        className="w-full btn-primary opacity-70 cursor-not-allowed flex justify-center items-center"
                        disabled
                      >
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </button>
                    ) : (
                      <button 
                        className="w-full btn-primary"
                        onClick={handleCheckout}
                      >
                        Place Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
