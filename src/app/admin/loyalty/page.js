'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminLoyaltyProgram() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [loyaltyPoints, setLoyaltyPoints] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [settings, setSettings] = useState({
    pointsPerEuro: 10,
    expiryDays: 180,
    welcomeBonus: 50
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch loyalty data
  useEffect(() => {
    async function fetchLoyaltyData() {
      try {
        setIsLoading(true);
        
        // Fetch loyalty transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('loyalty_transactions')
          .select(`
            *,
            profiles (email, id)
          `)
          .order('created_at', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Fetch loyalty rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('loyalty_rewards')
          .select('*')
          .order('points_required', { ascending: true });

        if (rewardsError) throw rewardsError;

        // Fetch loyalty settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('loyalty_settings')
          .select('*')
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          // PGRST116 is "No rows returned" which is fine for defaults
          throw settingsError;
        }

        // Use data from database or create placeholder data
        if (transactionsData && transactionsData.length > 0) {
          setLoyaltyPoints(transactionsData);
        } else {
          // Placeholder data
          const placeholderPoints = Array(15).fill(null).map((_, i) => ({
            id: `placeholder-${i}`,
            user_id: `user-${i % 5}`,
            points: Math.floor(Math.random() * 100) + 10,
            description: ['Order purchase', 'Welcome bonus', 'Birthday reward', 'Referral bonus'][Math.floor(Math.random() * 4)],
            created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            profiles: {
              email: `user${i % 5}@example.com`,
              id: `user-${i % 5}`
            }
          }));
          setLoyaltyPoints(placeholderPoints);
        }

        if (rewardsData && rewardsData.length > 0) {
          setRewards(rewardsData);
        } else {
          // Placeholder rewards
          const placeholderRewards = [
            { id: 'reward-1', name: 'Free Coffee', description: 'Any small coffee of your choice', points_required: 100, active: true },
            { id: 'reward-2', name: 'Pastry Discount', description: '50% off any pastry', points_required: 150, active: true },
            { id: 'reward-3', name: 'Free Breakfast', description: 'Any breakfast item with drink', points_required: 300, active: true },
            { id: 'reward-4', name: 'Coffee Bundle', description: '5 free coffees of any size', points_required: 500, active: false }
          ];
          setRewards(placeholderRewards);
        }

        if (settingsData) {
          setSettings({
            pointsPerEuro: settingsData.points_per_euro || 10,
            expiryDays: settingsData.expiry_days || 180,
            welcomeBonus: settingsData.welcome_bonus || 50
          });
        }
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLoyaltyData();
  }, []);

  // Handle reward form input changes
  const handleRewardInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRewardForm({
      ...rewardForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle reward form submission
  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!rewardForm.name) errors.name = 'Name is required';
    if (!rewardForm.description) errors.description = 'Description is required';
    if (!rewardForm.pointsRequired) {
      errors.pointsRequired = 'Points required is required';
    } else if (isNaN(rewardForm.pointsRequired) || rewardForm.pointsRequired <= 0) {
      errors.pointsRequired = 'Points must be a positive number';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const newReward = {
        name: rewardForm.name,
        description: rewardForm.description,
        points_required: parseInt(rewardForm.pointsRequired),
        active: rewardForm.active
      };
      
      // In a real app, this would save to the database
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .insert([newReward])
        .select();
        
      if (error) throw error;
      
      // Update UI
      if (data) {
        setRewards([...rewards, data[0]]);
      } else {
        // For placeholder data
        const placeholderId = `reward-${Date.now()}`;
        const newPlaceholderReward = {
          ...newReward,
          id: placeholderId
        };
        setRewards([...rewards, newPlaceholderReward]);
      }
      
      // Reset form
      setRewardForm({
        name: '',
        description: '',
        pointsRequired: '',
        active: true
      });
      setFormErrors({});
      setSuccessMessage('Reward added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding reward:', error);
      setFormErrors({ submit: error.message });
    }
  };

  // Handle settings update
  const updateSettings = async (newSettings) => {
    try {
      // In a real app, this would update the database
      const { error } = await supabase
        .from('loyalty_settings')
        .upsert([{
          id: 1, // Assuming single row for settings
          points_per_euro: newSettings.pointsPerEuro,
          expiry_days: newSettings.expiryDays,
          welcome_bonus: newSettings.welcomeBonus
        }]);
        
      if (error) throw error;
      
      // Update local state
      setSettings(newSettings);
      setSuccessMessage('Settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
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

  // Calculate total points for a user
  const calculateTotalPoints = (userId) => {
    return loyaltyPoints
      .filter(tx => tx.user_id === userId)
      .reduce((sum, tx) => sum + tx.points, 0);
  };

  // Get unique customers
  const getUniqueCustomers = () => {
    const uniqueCustomersMap = {};
    loyaltyPoints.forEach(tx => {
      if (tx.profiles) {
        uniqueCustomersMap[tx.user_id] = {
          id: tx.user_id,
          email: tx.profiles.email,
          totalPoints: calculateTotalPoints(tx.user_id)
        };
      }
    });
    return Object.values(uniqueCustomersMap);
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
            <h1 className="text-2xl font-bold text-amber-900">Loyalty Program Management</h1>
            <p className="text-gray-600">Manage rewards, points, and loyalty settings</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loyalty Statistics */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-amber-900 mb-4">Loyalty Program Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-amber-800">Total Customers</p>
                  <p className="text-2xl font-bold text-amber-900">{getUniqueCustomers().length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800">Points Awarded</p>
                  <p className="text-2xl font-bold text-green-900">
                    {loyaltyPoints.reduce((sum, tx) => sum + (tx.points > 0 ? tx.points : 0), 0)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">Points Redeemed</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.abs(loyaltyPoints.reduce((sum, tx) => sum + (tx.points < 0 ? tx.points : 0), 0))}
                  </p>
                </div>
              </div>
              
              <h3 className="text-md font-medium text-gray-700 mb-2">Top Loyalty Customers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getUniqueCustomers()
                      .sort((a, b) => b.totalPoints - a.totalPoints)
                      .slice(0, 5)
                      .map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.totalPoints}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedCustomer(customer.id)}
                              className="text-amber-600 hover:text-amber-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Loyalty Settings */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-amber-900 mb-4">Program Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="pointsPerEuro" className="block text-sm font-medium text-gray-700">
                  Points per €1
                </label>
                <input
                  type="number"
                  min="1"
                  id="pointsPerEuro"
                  value={settings.pointsPerEuro}
                  onChange={(e) => setSettings({...settings, pointsPerEuro: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="expiryDays" className="block text-sm font-medium text-gray-700">
                  Points Expiry (days)
                </label>
                <input
                  type="number"
                  min="1"
                  id="expiryDays"
                  value={settings.expiryDays}
                  onChange={(e) => setSettings({...settings, expiryDays: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="welcomeBonus" className="block text-sm font-medium text-gray-700">
                  Welcome Bonus Points
                </label>
                <input
                  type="number"
                  min="0"
                  id="welcomeBonus"
                  value={settings.welcomeBonus}
                  onChange={(e) => setSettings({...settings, welcomeBonus: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              
              <button
                onClick={() => updateSettings(settings)}
                className="w-full px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* Rewards Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-amber-900 mb-4">Loyalty Rewards</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reward
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rewards.map((reward) => (
                    <tr key={reward.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reward.name}</div>
                        <div className="text-sm text-gray-500">{reward.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reward.points_required}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reward.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {reward.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-amber-600 hover:text-amber-900 mr-3"
                          onClick={() => {
                            // In a real app, this would implement editing logic
                            setRewardForm({
                              name: reward.name,
                              description: reward.description,
                              pointsRequired: reward.points_required,
                              active: reward.active
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            // In a real app, this would implement deletion logic
                            if (window.confirm('Are you sure you want to delete this reward?')) {
                              setRewards(rewards.filter(r => r.id !== reward.id));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Add Reward Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-amber-900 mb-4">Add New Reward</h2>
            
            <form onSubmit={handleRewardSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Reward Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={rewardForm.name}
                  onChange={handleRewardInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={rewardForm.description}
                  onChange={handleRewardInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                ></textarea>
                {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
              </div>
              
              <div>
                <label htmlFor="pointsRequired" className="block text-sm font-medium text-gray-700">Points Required</label>
                <input
                  type="number"
                  id="pointsRequired"
                  name="pointsRequired"
                  min="1"
                  value={rewardForm.pointsRequired}
                  onChange={handleRewardInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
                {formErrors.pointsRequired && <p className="mt-1 text-sm text-red-600">{formErrors.pointsRequired}</p>}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={rewardForm.active}
                  onChange={handleRewardInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              {formErrors.submit && <p className="text-sm text-red-600">{formErrors.submit}</p>}
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Add Reward
              </button>
            </form>
          </div>
        </div>
        
        {/* Recent Points Transactions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-amber-900 mb-4">Recent Points Transactions</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loyaltyPoints.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.profiles?.email || 'Unknown User'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points > 0 ? `+${transaction.points}` : transaction.points}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 