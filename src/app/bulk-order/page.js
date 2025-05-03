'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BulkOrderPage() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchBulkProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('bulk_only', true);
      if (!error) setProducts(data);
    };
    fetchBulkProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number(value),
    }));
  };

  const handleSubmit = async () => {
    const orderedItems = products
      .filter((product) => quantities[product.id] > 0)
      .map((product) => ({
        product_id: product.id,
        quantity: quantities[product.id],
      }));

    if (orderedItems.length === 0) {
      setStatus('❌ Please select at least one item');
      return;
    }

    // TEMP: simulate a logged-in user
    const userId = '00000000-0000-0000-0000-000000000000';

    try {
      // Create bulk order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: userId, is_bulk: true }])
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

      // Add loyalty points (1 point per €1 spent)
      const totalSpent = products
        .filter((p) => quantities[p.id] > 0)
        .reduce((sum, p) => sum + p.price * quantities[p.id], 0);

      const { error: pointsError } = await supabase
        .from('loyalty_transactions')
        .insert([
          {
            user_id: userId,
            points: Math.floor(totalSpent),
            description: `Bulk Order #${order.id}`,
          },
        ]);

      if (pointsError) throw pointsError;

      setStatus('✅ Bulk order placed successfully!');
      setQuantities({});
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to place bulk order');
    }
  };

  const totalAmount = products
    .filter((p) => quantities[p.id] > 0)
    .reduce((sum, p) => sum + p.price * quantities[p.id], 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Bulk Product Ordering</h1>
      
      {status && <p className="mb-4 text-sm">{status}</p>}

      {products.length === 0 && <p>Loading products...</p>}
      <div className="grid gap-6">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-600">€{product.price}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Quantity"
                value={quantities[product.id] || ''}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                className="border px-2 py-1 rounded w-24"
              />
              {quantities[product.id] > 0 && (
                <span className="text-sm">
                  Subtotal: €{(product.price * quantities[product.id]).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalAmount > 0 && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="flex justify-between font-semibold">
            <span>Total Amount:</span>
            <span>€{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit Bulk Order
      </button>
    </div>
  );
}
