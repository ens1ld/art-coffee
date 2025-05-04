'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Order status options
const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
  { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export default function AdminOrders() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Placeholder data if no orders
        if (!data || data.length === 0) {
          const placeholderOrders = Array(5).fill(null).map((_, i) => ({
            id: `placeholder-${i}`,
            table_number: Math.floor(Math.random() * 20) + 1,
            status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)].value,
            total: Math.floor(Math.random() * 50) + 5,
            customer_name: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'Sam Lee'][Math.floor(Math.random() * 5)],
            created_at: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
            order_items: Array(Math.floor(Math.random() * 4) + 1).fill(null).map((_, j) => ({
              id: `item-${i}-${j}`,
              product_name: ['Cappuccino', 'Latte', 'Espresso', 'Americano', 'Croissant', 'Muffin'][Math.floor(Math.random() * 6)],
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 8) + 2,
              notes: Math.random() > 0.7 ? 'Extra hot' : ''
            }))
          }));
          setOrders(placeholderOrders);
          setFilteredOrders(placeholderOrders);
        } else {
          setOrders(data);
          setFilteredOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
        (order.id && order.id.toString().includes(query)) ||
        (order.table_number && order.table_number.toString().includes(query))
      );
    }

    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'table') {
      result.sort((a, b) => a.table_number - b.table_number);
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, sortBy, searchQuery]);

  // Handle order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(true);
      
      // In a real app, this would update the database
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Update selected order if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusObj.color}`}>
        {statusObj.label}
      </span>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Order Management</h1>
            <p className="text-gray-600">View and manage customer orders</p>
          </div>
          <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="sr-only">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search by customer or table..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="table">Table Number</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Orders List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500">No orders found matching your filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-sm font-medium text-amber-900 truncate">
                          Order #{order.id.toString().slice(0, 8)}
                        </p>
                        <div className="sm:ml-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Details
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingOrder}
                          className="text-xs border border-gray-300 rounded py-1.5 px-2 bg-white"
                        >
                          {ORDER_STATUSES.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="truncate">Table: {order.table_number}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-2 sm:mt-0">
                        €{order.total?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-amber-900">
                    Order Details
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{selectedOrder.id.toString().slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Table: {selectedOrder.table_number}</p>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                    <ul className="divide-y divide-gray-200">
                      {selectedOrder.order_items && selectedOrder.order_items.map((item, index) => (
                        <li key={index} className="py-3 flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.quantity}x {item.product_name}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">Total</p>
                      <p className="text-sm font-medium text-gray-900">€{selectedOrder.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      disabled={updatingOrder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-800 hover:bg-amber-700"
                    onClick={() => {
                      // Print functionality would go here
                      alert('Print receipt functionality not implemented');
                    }}
                  >
                    Print Receipt
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