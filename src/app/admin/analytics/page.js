'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminAnalytics() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  
  // Analytics data
  const [salesData, setSalesData] = useState({
    total: 0,
    count: 0,
    average: 0,
    byDay: [],
    byCategory: []
  });
  const [topProducts, setTopProducts] = useState([]);
  const [customerData, setCustomerData] = useState({
    total: 0,
    new: 0,
    returning: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch actual data from Supabase
        // For now, we'll create placeholder data
        
        // Get date ranges for the selected time period
        const today = new Date();
        const startDate = new Date();
        if (timeRange === 'week') {
          startDate.setDate(today.getDate() - 7);
        } else if (timeRange === 'month') {
          startDate.setMonth(today.getMonth() - 1);
        } else if (timeRange === 'year') {
          startDate.setFullYear(today.getFullYear() - 1);
        }
        
        // Generate random sales data for each day in the range
        const dayLabels = [];
        const daySales = [];
        const dayCount = Math.round((today - startDate) / (24 * 60 * 60 * 1000));
        
        for (let i = 0; i < dayCount; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          dayLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          daySales.push(Math.floor(Math.random() * 500) + 100);
        }
        
        // Calculate total sales
        const totalSales = daySales.reduce((sum, val) => sum + val, 0);
        const orderCount = Math.floor(totalSales / 15); // Roughly estimate order count
        
        // Generate category sales data
        const categories = ['Coffee', 'Tea', 'Pastries', 'Breakfast', 'Lunch', 'Desserts'];
        const categorySales = categories.map(cat => ({
          category: cat,
          sales: Math.floor(Math.random() * (totalSales * 0.4)) + (totalSales * 0.05)
        }));
        
        // Generate top products
        const productNames = [
          'Cappuccino', 'Latte', 'Espresso', 'Americano', 
          'Croissant', 'Pain au Chocolat', 'Avocado Toast',
          'Earl Grey Tea', 'Green Tea', 'Cheesecake',
          'Breakfast Sandwich', 'Iced Coffee'
        ];
        
        const generatedTopProducts = productNames
          .map(name => ({
            name,
            quantity: Math.floor(Math.random() * 100) + 10,
            revenue: Math.floor(Math.random() * 300) + 50
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Generate customer data
        const totalCustomers = Math.floor(Math.random() * 200) + 50;
        const newCustomers = Math.floor(totalCustomers * 0.3);
        const returningCustomers = totalCustomers - newCustomers;
        
        // Update state with generated data
        setSalesData({
          total: totalSales,
          count: orderCount,
          average: Math.round(totalSales / orderCount),
          byDay: {
            labels: dayLabels,
            data: daySales
          },
          byCategory: categorySales
        });
        
        setTopProducts(generatedTopProducts);
        
        setCustomerData({
          total: totalCustomers,
          new: newCustomers,
          returning: returningCustomers
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            <h1 className="text-2xl font-bold text-amber-900">Analytics Dashboard</h1>
            <p className="text-gray-600">View sales data, customer analytics, and business insights</p>
          </div>
          <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Time Range:</span>
              <div className="relative z-0 inline-flex shadow-sm rounded-md">
                <button
                  type="button"
                  onClick={() => setTimeRange('week')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                    timeRange === 'week' 
                    ? 'bg-amber-800 text-white border-amber-800' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('month')}
                  className={`relative inline-flex items-center px-4 py-2 border-t border-b ${
                    timeRange === 'month' 
                    ? 'bg-amber-800 text-white border-amber-800' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('year')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                    timeRange === 'year' 
                    ? 'bg-amber-800 text-white border-amber-800' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
          </div>
        ) : (
          <>
            {/* Sales Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-amber-900 mb-2">Total Sales</h2>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(salesData.total)}</p>
                <p className="text-sm text-gray-500 mt-1">For the selected period</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-amber-900 mb-2">Orders</h2>
                <p className="text-3xl font-bold text-gray-800">{salesData.count}</p>
                <p className="text-sm text-gray-500 mt-1">Total orders processed</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-amber-900 mb-2">Average Order</h2>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(salesData.average)}</p>
                <p className="text-sm text-gray-500 mt-1">Average order value</p>
              </div>
            </div>
            
            {/* Sales Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-amber-900 mb-6">Sales Trend</h2>
              
              {/* In a real app, we would use a chart library like Chart.js */}
              {/* For this prototype, we'll display a simple visualization */}
              <div className="h-64 flex items-end space-x-2">
                {salesData.byDay.data.map((value, index) => {
                  const height = `${Math.max(5, (value / Math.max(...salesData.byDay.data)) * 100)}%`;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-amber-500 rounded-t"
                        style={{ height }}
                        title={`${salesData.byDay.labels[index]}: ${formatCurrency(value)}`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left h-6 overflow-hidden">
                        {salesData.byDay.labels[index]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Top Products and Category Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-amber-900 mb-4">Top Products</h2>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{product.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Category Sales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-amber-900 mb-4">Sales by Category</h2>
                
                <div className="space-y-4">
                  {salesData.byCategory.map((category, index) => {
                    const percentage = Math.round((category.sales / salesData.total) * 100);
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{category.category}</span>
                          <span className="text-sm font-medium text-gray-700">{formatCurrency(category.sales)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Customer Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-amber-900 mb-4">Customer Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="text-sm font-medium text-amber-800 mb-1">Total Customers</h3>
                  <p className="text-2xl font-bold text-amber-900">{customerData.total}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-1">New Customers</h3>
                  <p className="text-2xl font-bold text-green-900">{customerData.new}</p>
                  <p className="text-xs text-green-700">{Math.round((customerData.new / customerData.total) * 100)}% of total</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">Returning Customers</h3>
                  <p className="text-2xl font-bold text-blue-900">{customerData.returning}</p>
                  <p className="text-xs text-blue-700">{Math.round((customerData.returning / customerData.total) * 100)}% of total</p>
                </div>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-amber-900 mb-4">Export Data</h2>
              
              <div className="flex flex-wrap gap-4">
                <button className="inline-flex items-center px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as CSV
                </button>
                
                <button className="inline-flex items-center px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export as PDF
                </button>
                
                <button className="inline-flex items-center px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Schedule Reports
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 