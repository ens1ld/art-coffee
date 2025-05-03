'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OrderPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [status, setStatus] = useState('');

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

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(cart).length === 0) {
      setStatus('❌ Please add items to your cart');
      return;
    }

    // TEMP: simulate a logged-in user
    const userId = '00000000-0000-0000-0000-000000000000';

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = Object.entries(cart).map(([productId, quantity]) => ({
        order_id: order.id,
        product_id: productId,
        quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add loyalty points (1 point per €1 spent)
      const totalSpent = products
        .filter((p) => cart[p.id])
        .reduce((sum, p) => sum + p.price * cart[p.id], 0);

      const { error: pointsError } = await supabase
        .from('loyalty_transactions')
        .insert([
          {
            user_id: userId,
            points: Math.floor(totalSpent),
            description: `Order #${order.id}`,
          },
        ]);

      if (pointsError) throw pointsError;

      setStatus('✅ Order placed successfully!');
      setCart({});
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to place order');
    }
  };

  const cartTotal = products
    .filter((p) => cart[p.id])
    .reduce((sum, p) => sum + p.price * cart[p.id], 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">☕ Make Your Own Coffee</h1>
      
      {status && <p className="mb-4 text-sm">{status}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          {products.length === 0 && <p>Loading menu...</p>}
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded-md shadow">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">€{product.price}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => addToCart(product.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  {cart[product.id] && (
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
          {Object.keys(cart).length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {products
                  .filter((p) => cart[p.id])
                  .map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span>
                        {product.name} × {cart[product.id]}
                      </span>
                      <span>€{(product.price * cart[product.id]).toFixed(2)}</span>
                    </div>
                  ))}
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
