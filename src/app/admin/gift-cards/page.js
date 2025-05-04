'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminGiftCards() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [giftCards, setGiftCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    recipient_email: '',
    sender_name: '',
    recipient_name: '',
    amount: '',
    message: '',
    delivery_date: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch gift cards
  useEffect(() => {
    async function fetchGiftCards() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('gift_cards')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Placeholder data if no gift cards
        if (!data || data.length === 0) {
          const placeholderCards = Array(10).fill(null).map((_, i) => ({
            id: `placeholder-${i}`,
            code: `GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            amount: Math.floor(Math.random() * 50) + 10,
            balance: Math.floor(Math.random() * 50) + 10, // Some may be partially used
            recipient_email: `recipient${i}@example.com`,
            sender_name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Lisa Brown'][Math.floor(Math.random() * 4)],
            recipient_name: ['Alex Davis', 'Sam Wilson', 'Taylor Moore', 'Jordan Lee'][Math.floor(Math.random() * 4)],
            message: i % 3 === 0 ? 'Happy Birthday!' : i % 3 === 1 ? 'Thank you for your help!' : 'Enjoy your coffee!',
            status: i % 5 === 0 ? 'pending' : i % 10 === 0 ? 'expired' : 'active',
            created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
            delivery_date: new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            is_delivered: i % 3 !== 0
          }));
          setGiftCards(placeholderCards);
          setFilteredCards(placeholderCards);
        } else {
          setGiftCards(data);
          setFilteredCards(data);
        }
      } catch (error) {
        console.error('Error fetching gift cards:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGiftCards();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...giftCards];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(card => card.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        (card.recipient_email && card.recipient_email.toLowerCase().includes(query)) ||
        (card.recipient_name && card.recipient_name.toLowerCase().includes(query)) ||
        (card.sender_name && card.sender_name.toLowerCase().includes(query)) ||
        (card.code && card.code.toLowerCase().includes(query))
      );
    }

    setFilteredCards(result);
  }, [giftCards, statusFilter, searchQuery]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle gift card form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.recipient_email) errors.recipient_email = 'Recipient email is required';
    if (!formData.recipient_name) errors.recipient_name = 'Recipient name is required';
    if (!formData.sender_name) errors.sender_name = 'Sender name is required';
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Generate a random gift card code
      const giftCardCode = `GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const newGiftCard = {
        code: giftCardCode,
        amount: parseFloat(formData.amount),
        balance: parseFloat(formData.amount), // Initially the balance equals the amount
        recipient_email: formData.recipient_email,
        recipient_name: formData.recipient_name,
        sender_name: formData.sender_name,
        message: formData.message || null,
        status: 'active',
        delivery_date: formData.delivery_date || new Date().toISOString(),
        is_delivered: formData.delivery_date ? new Date(formData.delivery_date) <= new Date() : true
      };
      
      // In a real app, this would save to the database
      const { data, error } = await supabase
        .from('gift_cards')
        .insert([newGiftCard])
        .select();
        
      if (error) throw error;
      
      // Update UI
      if (data) {
        setGiftCards([data[0], ...giftCards]);
      } else {
        // For placeholder data
        const newPlaceholderCard = {
          ...newGiftCard,
          id: `placeholder-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        setGiftCards([newPlaceholderCard, ...giftCards]);
      }
      
      // Reset form
      setFormData({
        recipient_email: '',
        sender_name: '',
        recipient_name: '',
        amount: '',
        message: '',
        delivery_date: ''
      });
      setFormErrors({});
      setSuccessMessage('Gift card created successfully!');
      setShowCreateForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error creating gift card:', error);
      setFormErrors({ submit: error.message });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      // In a real app, this would update the database
      const { error } = await supabase
        .from('gift_cards')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;

      // Update local state
      setGiftCards(giftCards.map(card => 
        card.id === id ? { ...card, status: newStatus } : card
      ));
      
      setSuccessMessage(`Gift card status updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating gift card status:', error);
    }
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
            <h1 className="text-2xl font-bold text-amber-900">Gift Card Management</h1>
            <p className="text-gray-600">Create and manage gift cards</p>
          </div>
          <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            {successMessage}
          </div>
        )}
        
        {/* Gift Card Creation Button/Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {!showCreateForm ? (
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-amber-900">Gift Cards</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Gift Card
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-amber-900">Create New Gift Card</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipient_email" className="block text-sm font-medium text-gray-700">Recipient Email</label>
                  <input
                    type="email"
                    id="recipient_email"
                    name="recipient_email"
                    value={formData.recipient_email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {formErrors.recipient_email && <p className="mt-1 text-sm text-red-600">{formErrors.recipient_email}</p>}
                </div>
                
                <div>
                  <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700">Recipient Name</label>
                  <input
                    type="text"
                    id="recipient_name"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {formErrors.recipient_name && <p className="mt-1 text-sm text-red-600">{formErrors.recipient_name}</p>}
                </div>
                
                <div>
                  <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700">Sender Name</label>
                  <input
                    type="text"
                    id="sender_name"
                    name="sender_name"
                    value={formData.sender_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {formErrors.sender_name && <p className="mt-1 text-sm text-red-600">{formErrors.sender_name}</p>}
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {formErrors.amount && <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>}
                </div>
                
                <div>
                  <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700">Delivery Date (Optional)</label>
                  <input
                    type="date"
                    id="delivery_date"
                    name="delivery_date"
                    value={formData.delivery_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Personal Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  ></textarea>
                </div>
                
                {formErrors.submit && <p className="md:col-span-2 text-sm text-red-600">{formErrors.submit}</p>}
                
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Create Gift Card
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="sr-only">Search Gift Cards</label>
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
                  className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 pr-12"
                  placeholder="Search by email, name, or code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="status_filter" className="block text-sm font-medium text-gray-700 mr-2">Status:</label>
              <select
                id="status_filter"
                name="status_filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Gift Cards List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredCards.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No gift cards found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No gift cards match your current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gift Card
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sender
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCards.map((card) => (
                      <tr key={card.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{card.code}</div>
                          <div className="text-sm text-gray-500">{formatDate(card.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{card.recipient_name}</div>
                          <div className="text-sm text-gray-500">{card.recipient_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{card.sender_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(card.amount)}</div>
                          {card.balance !== card.amount && (
                            <div className="text-xs text-gray-500">Balance: {formatCurrency(card.balance)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(card.status)}`}>
                            {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(card.delivery_date)}</div>
                          <div className="text-xs text-gray-500">
                            {card.is_delivered ? 'Delivered' : 'Scheduled'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              className="text-amber-600 hover:text-amber-900"
                              onClick={() => {
                                // In a real app, this would implement resend functionality
                                setSuccessMessage('Gift card email resent to recipient');
                                setTimeout(() => setSuccessMessage(''), 3000);
                              }}
                            >
                              Resend
                            </button>
                            
                            {card.status === 'active' && (
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleStatusChange(card.id, 'expired')}
                              >
                                Expire
                              </button>
                            )}
                            
                            {card.status === 'expired' && (
                              <button
                                className="text-green-600 hover:text-green-900"
                                onClick={() => handleStatusChange(card.id, 'active')}
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 