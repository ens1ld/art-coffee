'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const COFFEE_SIZES = [
  { id: 'small', name: 'Small', price: 0 },
  { id: 'medium', name: 'Medium', price: 0.5 },
  { id: 'large', name: 'Large', price: 1 },
];

const MILK_OPTIONS = [
  { id: 'none', name: 'No Milk', price: 0 },
  { id: 'whole', name: 'Whole Milk', price: 0 },
  { id: 'skim', name: 'Skim Milk', price: 0 },
  { id: 'oat', name: 'Oat Milk', price: 0.5 },
  { id: 'almond', name: 'Almond Milk', price: 0.5 },
  { id: 'soy', name: 'Soy Milk', price: 0.5 },
];

const EXTRA_OPTIONS = [
  { id: 'espresso', name: 'Extra Shot', price: 1 },
  { id: 'syrup', name: 'Flavor Syrup', price: 0.5 },
  { id: 'whipped', name: 'Whipped Cream', price: 0.5 },
  { id: 'cinnamon', name: 'Cinnamon', price: 0 },
];

export default function OrderPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [status, setStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customization, setCustomization] = useState({
    size: 'medium',
    milk: 'none',
    extras: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('bulk_only', false);
      if (!error) setProducts(data);
    };
    fetchProducts();
  }, []);

  const calculatePrice = (product, custom) => {
    let total = product.price;
    total += COFFEE_SIZES.find(s => s.id === custom.size)?.price || 0;
    total += MILK_OPTIONS.find(m => m.id === custom.milk)?.price || 0;
    total += custom.extras.reduce((sum, extra) => {
      const option = EXTRA_OPTIONS.find(e => e.id === extra);
      return sum + (option?.price || 0);
    }, 0);
    return total;
  };

  const addToCart = (product) => {
    const itemId = `${product.id}-${customization.size}-${customization.milk}-${customization.extras.join(',')}`;
    setCart((prev) => ({
      ...prev,
      [itemId]: {
        product,
        customization: { ...customization },
        quantity: (prev[itemId]?.quantity || 0) + 1,
      },
    }));
    setSelectedProduct(null);
    setCustomization({
      size: 'medium',
      milk: 'none',
      extras: [],
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(cart).length === 0) {
      setStatus('❌ Please add items to your cart');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = Object.entries(cart).map(([itemId, item]) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.customization.size,
        milk: item.customization.milk,
        extras: item.customization.extras,
        price: calculatePrice(item.product, item.customization),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add loyalty points (1 point per €1 spent)
      const totalSpent = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { error: pointsError } = await supabase
        .from('loyalty_transactions')
        .insert([
          {
            user_id: user.id,
            points: Math.floor(totalSpent),
            description: `Order #${order.id}`,
          },
        ]);

      if (pointsError) throw pointsError;

      setStatus('✅ Order placed successfully!');
      setCart({});
    } catch (error) {
      console.error(error);
      setStatus(`❌ ${error.message}`);
    }
  };

  const cartTotal = Object.entries(cart).reduce((sum, [itemId, item]) => {
    return sum + calculatePrice(item.product, item.customization) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-3xl font-bold mb-8 text-primary">☕ Customize Your Coffee</h1>

      {status && (
        <div className="mb-4 p-3 rounded bg-opacity-20 bg-primary text-primary text-sm">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary">Our Menu</h2>
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card-bg border border-card-border rounded-xl p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <h3 className="text-xl font-semibold text-primary">{product.name}</h3>
                <p className="text-secondary">€{product.price.toFixed(2)}</p>
                <p className="text-sm text-secondary mt-2">{product.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Panel */}
        {selectedProduct && (
          <div className="bg-card-bg border border-card-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Customize {selectedProduct.name}
            </h2>

            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-medium text-secondary mb-2">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {COFFEE_SIZES.map((size) => (
                    <button
                      key={size.id}
                      className={`p-2 rounded border ${
                        customization.size === size.id
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-card-border'
                      }`}
                      onClick={() => setCustomization((prev) => ({ ...prev, size: size.id }))}
                    >
                      {size.name}
                      {size.price > 0 && ` (+€${size.price})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Selection */}
              <div>
                <h3 className="text-lg font-medium text-secondary mb-2">Milk</h3>
                <div className="grid grid-cols-2 gap-2">
                  {MILK_OPTIONS.map((milk) => (
                    <button
                      key={milk.id}
                      className={`p-2 rounded border ${
                        customization.milk === milk.id
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-card-border'
                      }`}
                      onClick={() => setCustomization((prev) => ({ ...prev, milk: milk.id }))}
                    >
                      {milk.name}
                      {milk.price > 0 && ` (+€${milk.price})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div>
                <h3 className="text-lg font-medium text-secondary mb-2">Extras</h3>
                <div className="grid grid-cols-2 gap-2">
                  {EXTRA_OPTIONS.map((extra) => (
                    <label
                      key={extra.id}
                      className="flex items-center gap-2 p-2 rounded border border-card-border"
                    >
                      <input
                        type="checkbox"
                        checked={customization.extras.includes(extra.id)}
                        onChange={(e) => {
                          setCustomization((prev) => ({
                            ...prev,
                            extras: e.target.checked
                              ? [...prev.extras, extra.id]
                              : prev.extras.filter((id) => id !== extra.id),
                          }));
                        }}
                      />
                      {extra.name}
                      {extra.price > 0 && ` (+€${extra.price})`}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <p className="text-lg font-semibold text-primary mb-4">
                  Total: €{calculatePrice(selectedProduct, customization).toFixed(2)}
                </p>
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full btn-primary py-2 rounded"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Your Cart</h2>
          {Object.keys(cart).length === 0 ? (
            <p className="text-secondary">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(cart).map(([itemId, item]) => (
                <div
                  key={itemId}
                  className="bg-card-bg border border-card-border rounded-xl p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-secondary">
                        Size: {item.customization.size} | Milk: {item.customization.milk}
                        {item.customization.extras.length > 0 &&
                          ` | Extras: ${item.customization.extras.join(', ')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        €{(calculatePrice(item.product, item.customization) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="mt-2 text-sm text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-primary">Total:</span>
                  <span className="text-xl font-semibold text-primary">
                    €{cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full mt-4 btn-primary py-2 rounded"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
