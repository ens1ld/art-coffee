'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminCustomers() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'user')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Placeholder data if no customers
        if (!data || data.length === 0) {
          const placeholderCustomers = Array(15).fill(null).map((_, i) => {
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
            const lastOrderDate = new Date(createdDate);
            lastOrderDate.setDate(createdDate.getDate() + Math.floor(Math.random() * 30));
            
            return {
              id: `placeholder-${i}`,
              email: `customer${i}@example.com`,
              role: 'user',
              created_at: createdDate.toISOString(),
              updated_at: new Date().toISOString(),
              customer_data: {
                full_name: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'Sam Lee'][Math.floor(Math.random() * 5)],
                phone: `+1${Math.floor(Math.random() * 1000000000)}`,
                total_orders: Math.floor(Math.random() * 20),
                total_spent: Math.floor(Math.random() * 500) + 20,
                loyalty_points: Math.floor(Math.random() * 1000),
                last_order_date: i % 3 === 0 ? null : lastOrderDate.toISOString()
              }
            };
          });
          
          setCustomers(placeholderCustomers);
          setFilteredCustomers(placeholderCustomers);
          
          // Calculate stats
          const total = placeholderCustomers.length;
          const active = placeholderCustomers.filter(c => 
            c.customer_data.last_order_date && 
            new Date(c.customer_data.last_order_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length;
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const newThisMonth = placeholderCustomers.filter(c => 
            new Date(c.created_at) > oneMonthAgo
          ).length;
          
          setCustomerStats({
            total,
            active,
            newThisMonth
          });
        } else {
          // Process real data
          const processedData = data.map(customer => {
            // In a real app, you would have a more structured approach
            // Here we're assuming customer_data might exist or might need to be created
            const customerData = customer.customer_data || {
              full_name: customer.email.split('@')[0],
              phone: '',
              total_orders: 0,
              total_spent: 0,
              loyalty_points: 0,
              last_order_date: null
            };
            
            return {
              ...customer,
              customer_data: customerData
            };
          });
          
          setCustomers(processedData);
          setFilteredCustomers(processedData);
          
          // Calculate stats
          const total = processedData.length;
          const active = processedData.filter(c => 
            c.customer_data.last_order_date && 
            new Date(c.customer_data.last_order_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length;
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const newThisMonth = processedData.filter(c => 
            new Date(c.created_at) > oneMonthAgo
          ).length;
          
          setCustomerStats({
            total,
            active,
            newThisMonth
          });
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => 
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.customer_data?.full_name && customer.customer_data.full_name.toLowerCase().includes(query)) ||
      (customer.customer_data?.phone && customer.customer_data.phone.includes(query))
    );
    
    setFilteredCustomers(filtered);
  }, [customers, searchQuery]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  // Handle customer selection for detailed view
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
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
            <h1 className="text-2xl font-bold text-amber-900">Customer Management</h1>
            <p className="text-gray-600">View and manage customer data</p>
          </div>
          <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-green-50 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-xl font-bold text-gray-800">{customerStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-blue-50 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Past 30 Days</p>
                <p className="text-xl font-bold text-gray-800">{customerStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="rounded-md bg-amber-50 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">New This Month</p>
                <p className="text-xl font-bold text-gray-800">{customerStats.newThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <div className="max-w-md">
              <label htmlFor="search" className="sr-only">Search Customers</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="Search by name, email, or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer List and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search query.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Spent
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr 
                          key={customer.id}
                          className={`${selectedCustomer?.id === customer.id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                          onClick={() => viewCustomerDetails(customer)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="text-amber-800 font-medium">
                                  {customer.customer_data?.full_name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.customer_data?.full_name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.customer_data?.total_orders || 0}</div>
                            <div className="text-xs text-gray-500">
                              Last: {formatDate(customer.customer_data?.last_order_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(customer.customer_data?.total_spent || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.customer_data?.loyalty_points || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              className="text-amber-600 hover:text-amber-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewCustomerDetails(customer);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Customer Details */}
          <div>
            {selectedCustomer ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-medium text-amber-900">Customer Details</h2>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-amber-800 text-2xl font-medium">
                      {selectedCustomer.customer_data?.full_name?.charAt(0) || selectedCustomer.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      {selectedCustomer.customer_data?.full_name || 'No name provided'}
                    </h3>
                    <p className="text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm text-gray-900">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm text-gray-900">
                          {selectedCustomer.customer_data?.phone || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Account Information</h4>
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Joined</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedCustomer.created_at)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Last Order</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(selectedCustomer.customer_data?.last_order_date)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Total Orders</span>
                        <span className="text-sm text-gray-900">
                          {selectedCustomer.customer_data?.total_orders || 0}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Total Spent</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(selectedCustomer.customer_data?.total_spent || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Loyalty Points</span>
                        <span className="text-sm text-gray-900">
                          {selectedCustomer.customer_data?.loyalty_points || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // In a real app, this would implement order history functionality
                      router.push(`/admin/orders?customer=${selectedCustomer.id}`);
                    }}
                    className="w-full text-center px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50"
                  >
                    View Order History
                  </button>
                  
                  <button
                    onClick={() => {
                      // In a real app, this would implement email functionality
                      alert(`Sending email to ${selectedCustomer.email}`);
                    }}
                    className="w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No customer selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a customer from the list to view details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 