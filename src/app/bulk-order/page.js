'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function BulkOrderPage() {
  const [products, setProducts] = useState([
    {
      id: 101,
      name: 'Premium Coffee Beans (5kg)',
      price: 120.00,
      description: 'Our signature coffee beans, perfect for offices and small cafes.',
      image: '/images/coffee-beans-bulk.jpg',
      bulk_only: true
    },
    {
      id: 102,
      name: 'Coffee Brewing Equipment Set',
      price: 350.00,
      description: 'Complete set for professional brewing, includes grinder and filters.',
      image: '/images/brewing-equipment.jpg',
      bulk_only: true
    },
    {
      id: 103,
      name: 'Signature Blend (10kg)',
      price: 220.00,
      description: 'Our most popular blend, dark roast with notes of chocolate and caramel.',
      image: '/images/signature-blend.jpg',
      bulk_only: true
    },
    {
      id: 104,
      name: 'Disposable Cups (500 count)',
      price: 75.00,
      description: 'Eco-friendly disposable cups with lids, suitable for hot and cold drinks.',
      image: '/images/disposable-cups.jpg',
      bulk_only: true
    },
    {
      id: 105,
      name: 'Gift Card Bundle (25 x $20)',
      price: 450.00,
      description: 'Corporate gift card bundle with custom branding options.',
      image: '/images/gift-cards-bulk.jpg',
      bulk_only: true
    },
    {
      id: 106,
      name: 'Catering Coffee Service',
      price: 200.00,
      description: 'Coffee catering for events and meetings, includes setup and service.',
      image: '/images/catering-service.jpg',
      bulk_only: true
    }
  ]);
  
  const [quantities, setQuantities] = useState({});
  const [status, setStatus] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number(value),
    }));
  };

  const handleInfoChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setStatus('login-required');
      return;
    }
    
    const orderedItems = products
      .filter((product) => quantities[product.id] > 0)
      .map((product) => ({
        product_id: product.id,
        quantity: quantities[product.id],
      }));

    if (orderedItems.length === 0) {
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('processing');

    try {
      // Create bulk order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
          user_id: user.id, 
          is_bulk: true,
          business_info: businessInfo,
          total_amount: totalAmount
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = orderedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add loyalty points (1 point per $1 spent)
      const { error: pointsError } = await supabase
        .from('loyalty_transactions')
        .insert([
          {
            user_id: user.id,
            points: Math.floor(totalAmount),
            description: `Bulk Order #${order.id}`,
          },
        ]);

      if (pointsError) throw pointsError;

      setStatus('success');
      setQuantities({});
      setBusinessInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = products
    .filter((p) => quantities[p.id] > 0)
    .reduce((sum, p) => sum + p.price * (quantities[p.id] || 0), 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-grow container-custom py-12">
        <h1 className="heading-2 mb-4 text-center">Bulk Ordering for Businesses</h1>
        
        <div className="text-center mb-10">
          <p className="paragraph max-w-3xl mx-auto">
            We offer special bulk options for businesses, events, and catering. Explore our selection of bulk products below.
          </p>
        </div>
        
        {status === 'login-required' && (
          <div className="mb-8 p-4 bg-primary/10 border border-primary rounded-lg">
            <h3 className="font-medium text-lg text-primary mb-2">Authentication Required</h3>
            <p className="text-text-secondary mb-4">
              Please log in or create an account to complete your bulk order.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login?redirectTo=/bulk-order" className="btn-primary">
                Log In
              </Link>
              <Link href="/signup" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="mb-8 p-4 bg-success/10 border border-success rounded-lg">
            <h3 className="font-medium text-lg text-success mb-2">Bulk Order Placed Successfully!</h3>
            <p className="text-text-secondary">
              Your order has been submitted. Our team will contact you shortly to confirm details and arrange delivery.
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mb-8 p-4 bg-error/10 border border-error rounded-lg">
            <h3 className="font-medium text-lg text-error mb-2">Error Processing Order</h3>
            <p className="text-text-secondary">
              Please ensure you've selected at least one product and filled in all required fields.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="heading-3 mb-6">Available Products</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-border rounded-lg overflow-hidden hover:shadow-card-hover transition-all">
                  <div className="aspect-video bg-gray-200 relative">
                    {/* Replace with actual product images */}
                    <div className="w-full h-full bg-[#F9F5F0] flex items-center justify-center">
                      <div className="text-primary text-5xl">☕</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <p className="text-text-secondary text-sm mt-2 mb-4">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center">
                      <label htmlFor={`quantity-${product.id}`} className="text-sm mr-3">Quantity:</label>
                      <input
                        id={`quantity-${product.id}`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantities[product.id] || ''}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="input-field py-1 px-3 w-24"
                      />
                      
                      {quantities[product.id] > 0 && (
                        <span className="ml-auto text-sm font-medium">
                          ${(product.price * quantities[product.id]).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#F9F5F0] rounded-lg p-6 border border-border">
              <h2 className="heading-3 mb-6">Your Order Summary</h2>
              
              {products.filter(p => quantities[p.id] > 0).length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {products.filter(p => quantities[p.id] > 0).map(product => (
                      <div key={product.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">{quantities[product.id]} × </span>
                          <span>{product.name}</span>
                        </div>
                        <span className="font-medium">${(product.price * quantities[product.id]).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-3 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="business-name" className="label">Business Name</label>
                      <input
                        id="business-name"
                        type="text"
                        required
                        value={businessInfo.name}
                        onChange={(e) => handleInfoChange('name', e.target.value)}
                        className="input-field"
                        placeholder="Your Business Name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="business-email" className="label">Business Email</label>
                      <input
                        id="business-email"
                        type="email"
                        required
                        value={businessInfo.email}
                        onChange={(e) => handleInfoChange('email', e.target.value)}
                        className="input-field"
                        placeholder="contact@business.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="business-phone" className="label">Phone Number</label>
                      <input
                        id="business-phone"
                        type="tel"
                        required
                        value={businessInfo.phone}
                        onChange={(e) => handleInfoChange('phone', e.target.value)}
                        className="input-field"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="business-address" className="label">Delivery Address</label>
                      <textarea
                        id="business-address"
                        required
                        value={businessInfo.address}
                        onChange={(e) => handleInfoChange('address', e.target.value)}
                        className="input-field min-h-[80px]"
                        placeholder="Street Address, City, State, ZIP"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="order-notes" className="label">Special Instructions (Optional)</label>
                      <textarea
                        id="order-notes"
                        value={businessInfo.notes}
                        onChange={(e) => handleInfoChange('notes', e.target.value)}
                        className="input-field min-h-[80px]"
                        placeholder="Any special requests or delivery instructions..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={totalAmount === 0 || loading}
                      className={`w-full btn-primary flex items-center justify-center ${
                        totalAmount === 0 ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Submit Bulk Order'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-text-secondary text-center py-8">
                  Select products to see your order summary.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <section className="mt-16 bg-[#F9F5F0] rounded-lg p-8">
          <h2 className="heading-3 mb-6 text-center">Why Choose Our Bulk Ordering?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Wholesale Pricing</h3>
              <p className="text-text-secondary">Significant discounts on bulk purchases compared to retail prices.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Free Delivery</h3>
              <p className="text-text-secondary">Complimentary delivery on bulk orders within the city limits.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Custom Orders</h3>
              <p className="text-text-secondary">Can't find what you need? Contact us for customized bulk orders.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
