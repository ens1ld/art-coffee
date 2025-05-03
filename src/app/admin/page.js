'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/components/ProfileFetcher';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const { profile, user, loading, error } = useProfile();
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const router = useRouter();

  // Check authentication and authorization
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirectTo=/admin');
    } else if (!loading && profile && profile.role !== 'admin' && profile.role !== 'superadmin') {
      router.push('/not-authorized');
    } else if (!loading && profile && profile.role === 'admin' && !profile.approved) {
      router.push('/pending-approval');
    }
  }, [loading, user, profile, router]);

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setFetchingOrders(true);
        
        // Get order count
        const { data: countData, error: countError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true });
        
        if (countError) throw countError;
        setOrderCount(countData?.length || 0);
        
        // Get recent orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (orderError) throw orderError;
        setRecentOrders(orderData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDashboardError('Failed to load dashboard data. Please try again.');
      } finally {
        setFetchingOrders(false);
      }
    };
    
    if (user && (profile?.role === 'admin' || profile?.role === 'superadmin') && profile?.approved) {
      fetchDashboardData();
    }
  }, [user, profile]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-lg">Loading admin dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error || 'Authentication required to access admin dashboard'}</p>
            </div>
            <button 
              onClick={() => router.push('/auth?redirectTo=/admin')}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              Sign In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profile.role !== 'admin' && profile.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Not Authorized</h1>
            <p className="mb-6">You don&apos;t have permission to access the admin dashboard.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              Return to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profile.role === 'admin' && !profile.approved) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-amber-700 mb-4">Admin Approval Pending</h1>
            <p className="mb-6">Your admin account is pending approval from a superadmin.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
            >
              Return to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-amber-900 mb-8">Admin Dashboard</h1>
          
          {dashboardError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{dashboardError}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-amber-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Orders</h2>
              <p className="text-3xl font-bold">
                {fetchingOrders ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  orderCount
                )}
              </p>
              <p className="text-sm text-gray-500 mt-2">Total orders placed</p>
              <button 
                onClick={() => router.push('/admin/orders')}
                className="mt-4 text-amber-700 hover:text-amber-600"
              >
                View all orders →
              </button>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Products</h2>
              <p className="text-3xl font-bold">--</p>
              <p className="text-sm text-gray-500 mt-2">Available products</p>
              <button 
                onClick={() => router.push('/admin/products')}
                className="mt-4 text-amber-700 hover:text-amber-600"
              >
                Manage products →
              </button>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Gift Cards</h2>
              <p className="text-3xl font-bold">--</p>
              <p className="text-sm text-gray-500 mt-2">Active gift cards</p>
              <button 
                onClick={() => router.push('/admin/gift-cards')}
                className="mt-4 text-amber-700 hover:text-amber-600"
              >
                View gift cards →
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Recent Orders</h2>
            
            {fetchingOrders ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{order.id.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm">{order.profiles?.email || 'Anonymous'}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button 
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="text-amber-700 hover:text-amber-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No orders found</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Quick Actions</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/admin/new-product')}
                className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-left"
              >
                <h3 className="font-medium text-amber-900">Add New Product</h3>
                <p className="text-sm text-gray-600 mt-1">Create a new product in the catalog</p>
              </button>
              
              <button 
                onClick={() => router.push('/admin/reports')}
                className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-left"
              >
                <h3 className="font-medium text-amber-900">Generate Reports</h3>
                <p className="text-sm text-gray-600 mt-1">View sales and customer reports</p>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
