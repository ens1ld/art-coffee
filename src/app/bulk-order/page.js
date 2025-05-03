'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BulkOrderPage() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

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

  const handleSubmit = () => {
    const ordered = products
      .filter((product) => quantities[product.id] > 0)
      .map((product) => ({
        id: product.id,
        name: product.name,
        quantity: quantities[product.id],
      }));
    
    console.log('Bulk order submitted:', ordered);
    // In next steps, send this to Supabase "orders" and "order_items"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Bulk Product Ordering</h1>
      {products.length === 0 && <p>Loading products...</p>}
      <div className="grid gap-6">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-600">€{product.price}</p>
            <input
              type="number"
              min="0"
              placeholder="Quantity"
              value={quantities[product.id] || ''}
              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              className="mt-2 border px-2 py-1 rounded w-24"
            />
          </div>
        ))}
      </div>

      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit Bulk Order
      </button>
    </div>
  );
}
