'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          user_id,
          order_items (
            id,
            product_id,
            quantity,
            products (
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && ordersData) {
        setOrders(ordersData);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Admin Dashboard</h1>
      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => (
        <div key={order.id} className="border p-4 rounded mb-4">
          <div className="font-semibold mb-2">
            🧾 Order #{order.id} | User: {order.user_id}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {new Date(order.created_at).toLocaleString()}
          </div>
          <ul className="ml-4 list-disc">
            {order.order_items.map((item) => (
              <li key={item.id}>
                {item.products?.name} — Qty: {item.quantity} — €
                {item.products?.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
