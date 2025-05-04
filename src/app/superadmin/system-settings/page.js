'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SuperadminSystemSettings() {
  const { profile, loading, error } = useProfile();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    store_name: 'Art Coffee',
    store_phone: '+1 (123) 456-7890',
    store_email: 'info@artcoffee.com',
    store_address: '123 Coffee Street, Art City, AC 12345',
    store_hours: 'Mon-Fri: 7am-7pm, Sat-Sun: 8am-6pm',
    currency: 'EUR',
    tax_rate: 20
  });
  
  // Loyalty program settings
  const [loyaltySettings, setLoyaltySettings] = useState({
    enabled: true,
    points_per_euro: 10,
    welcome_bonus: 50,
    expiry_days: 180,
    min_points_redeem: 100
  });
  
  // Email notification settings
  const [emailSettings, setEmailSettings] = useState({
    new_order_notifications: true,
    order_status_updates: true,
    low_inventory_alerts: true,
    new_user_notifications: true,
    send_welcome_email: true,
    marketing_emails: false,
    sender_email: 'notifications@artcoffee.com',
    admin_email: 'admin@artcoffee.com'
  });
  
  // Database backup settings
  const [backupSettings, setBackupSettings] = useState({
    auto_backup_enabled: true,
    backup_frequency: 'daily',
    backup_time: '02:00',
    retention_days: 30,
    last_backup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  });

  // Check if user is superadmin
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== 'superadmin') {
        router.push('/not-authorized');
      }
    }
  }, [loading, profile, router]);

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch settings from the database
        // For now, we'll use placeholder data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use default settings defined above
        // In a real app, this would fetch from database tables
        
      } catch (error) {
        console.error('Error fetching settings:', error);
        setErrorMessage('Failed to fetch system settings: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (profile && profile.role === 'superadmin') {
      fetchSettings();
    }
  }, [profile]);

  // Handle general settings update
  const handleGeneralSettingsUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, this would save to the database
      // For example:
      // const { error } = await supabase
      //   .from('system_settings')
      //   .upsert([generalSettings]);
        
      // if (error) throw error;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessMessage('General settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating general settings:', error);
      setErrorMessage('Failed to update general settings: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle loyalty settings update
  const handleLoyaltySettingsUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, this would save to the database
      // For example:
      // const { error } = await supabase
      //   .from('loyalty_settings')
      //   .upsert([loyaltySettings]);
        
      // if (error) throw error;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessMessage('Loyalty program settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating loyalty settings:', error);
      setErrorMessage('Failed to update loyalty settings: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle email settings update
  const handleEmailSettingsUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, this would save to the database
      // For example:
      // const { error } = await supabase
      //   .from('email_settings')
      //   .upsert([emailSettings]);
        
      // if (error) throw error;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessMessage('Email notification settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating email settings:', error);
      setErrorMessage('Failed to update email settings: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle backup settings update
  const handleBackupSettingsUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, this would save to the database
      // For example:
      // const { error } = await supabase
      //   .from('backup_settings')
      //   .upsert([backupSettings]);
        
      // if (error) throw error;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessMessage('Backup settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating backup settings:', error);
      setErrorMessage('Failed to update backup settings: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle manual backup
  const handleManualBackup = async () => {
    try {
      // In a real app, this would trigger a database backup
      // For example: call an API endpoint
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last backup time
      setBackupSettings({
        ...backupSettings,
        last_backup: new Date().toISOString()
      });
      
      setSuccessMessage('Manual backup completed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error performing manual backup:', error);
      setErrorMessage('Failed to perform manual backup: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle input changes for general settings
  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: name === 'tax_rate' ? Number(value) : value
    });
  };

  // Handle input changes for loyalty settings
  const handleLoyaltyInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoyaltySettings({
      ...loyaltySettings,
      [name]: type === 'checkbox' ? checked : Number(value)
    });
  };

  // Handle input changes for email settings
  const handleEmailInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle input changes for backup settings
  const handleBackupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBackupSettings({
      ...backupSettings,
      [name]: type === 'checkbox' ? checked : 
              name === 'retention_days' ? Number(value) : value
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Check if user is not authorized
  if (!profile || profile.role !== 'superadmin') {
    return null; // Already redirecting in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">System Settings</h1>
            <p className="text-gray-600">Configure global settings for your Art Coffee application</p>
          </div>
          <Link href="/superadmin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Back to Superadmin
          </Link>
        </div>
        
        {/* Success and Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {errorMessage}
          </div>
        )}
        
        {/* Settings Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-amber-800 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'loyalty'
                    ? 'border-amber-800 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('loyalty')}
              >
                Loyalty Program
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-amber-800 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('email')}
              >
                Email Notifications
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'backup'
                    ? 'border-amber-800 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('backup')}
              >
                Database Backup
              </button>
            </nav>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="bg-white shadow rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
            </div>
          ) : (
            <div className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <form onSubmit={handleGeneralSettingsUpdate}>
                  <h2 className="text-lg font-medium text-amber-900 mb-6">General Settings</h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">Store Name</label>
                      <input
                        type="text"
                        id="store_name"
                        name="store_name"
                        value={generalSettings.store_name}
                        onChange={handleGeneralInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="store_email" className="block text-sm font-medium text-gray-700">Store Email</label>
                      <input
                        type="email"
                        id="store_email"
                        name="store_email"
                        value={generalSettings.store_email}
                        onChange={handleGeneralInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="store_phone" className="block text-sm font-medium text-gray-700">Store Phone</label>
                      <input
                        type="text"
                        id="store_phone"
                        name="store_phone"
                        value={generalSettings.store_phone}
                        onChange={handleGeneralInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        id="currency"
                        name="currency"
                        value={generalSettings.currency}
                        onChange={handleGeneralInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                      <input
                        type="number"
                        id="tax_rate"
                        name="tax_rate"
                        min="0"
                        max="100"
                        value={generalSettings.tax_rate}
                        onChange={handleGeneralInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="store_hours" className="block text-sm font-medium text-gray-700">Store Hours</label>
                      <input
                        type="text"
                        id="store_hours"
                        name="store_hours"
                        value={generalSettings.store_hours}
                        onChange={handleGeneralInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="store_address" className="block text-sm font-medium text-gray-700">Store Address</label>
                    <textarea
                      id="store_address"
                      name="store_address"
                      rows="3"
                      value={generalSettings.store_address}
                      onChange={handleGeneralInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Save General Settings
                    </button>
                  </div>
                </form>
              )}
              
              {/* Loyalty Program Settings */}
              {activeTab === 'loyalty' && (
                <form onSubmit={handleLoyaltySettingsUpdate}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-amber-900">Loyalty Program Settings</h2>
                    <div className="flex items-center">
                      <span className="mr-3 text-sm text-gray-600">Enable Loyalty Program</span>
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={loyaltySettings.enabled}
                          name="enabled"
                          onChange={handleLoyaltyInputChange}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="points_per_euro" className="block text-sm font-medium text-gray-700">Points per {generalSettings.currency === 'EUR' ? '€' : generalSettings.currency === 'USD' ? '$' : '£'}1</label>
                      <input
                        type="number"
                        id="points_per_euro"
                        name="points_per_euro"
                        min="1"
                        value={loyaltySettings.points_per_euro}
                        onChange={handleLoyaltyInputChange}
                        disabled={!loyaltySettings.enabled}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Number of points earned per unit of currency spent</p>
                    </div>
                    
                    <div>
                      <label htmlFor="welcome_bonus" className="block text-sm font-medium text-gray-700">Welcome Bonus Points</label>
                      <input
                        type="number"
                        id="welcome_bonus"
                        name="welcome_bonus"
                        min="0"
                        value={loyaltySettings.welcome_bonus}
                        onChange={handleLoyaltyInputChange}
                        disabled={!loyaltySettings.enabled}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Points given to new customers upon signup</p>
                    </div>
                    
                    <div>
                      <label htmlFor="expiry_days" className="block text-sm font-medium text-gray-700">Points Expiry (days)</label>
                      <input
                        type="number"
                        id="expiry_days"
                        name="expiry_days"
                        min="0"
                        value={loyaltySettings.expiry_days}
                        onChange={handleLoyaltyInputChange}
                        disabled={!loyaltySettings.enabled}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Number of days until points expire (0 = never)</p>
                    </div>
                    
                    <div>
                      <label htmlFor="min_points_redeem" className="block text-sm font-medium text-gray-700">Minimum Points to Redeem</label>
                      <input
                        type="number"
                        id="min_points_redeem"
                        name="min_points_redeem"
                        min="0"
                        value={loyaltySettings.min_points_redeem}
                        onChange={handleLoyaltyInputChange}
                        disabled={!loyaltySettings.enabled}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Minimum points required before they can be redeemed</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Save Loyalty Settings
                    </button>
                  </div>
                </form>
              )}
              
              {/* Email Notification Settings */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailSettingsUpdate}>
                  <h2 className="text-lg font-medium text-amber-900 mb-6">Email Notification Settings</h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                    <div>
                      <label htmlFor="sender_email" className="block text-sm font-medium text-gray-700">Sender Email Address</label>
                      <input
                        type="email"
                        id="sender_email"
                        name="sender_email"
                        value={emailSettings.sender_email}
                        onChange={handleEmailInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email address used to send notifications</p>
                    </div>
                    
                    <div>
                      <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">Admin Email Address</label>
                      <input
                        type="email"
                        id="admin_email"
                        name="admin_email"
                        value={emailSettings.admin_email}
                        onChange={handleEmailInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email address to receive admin notifications</p>
                    </div>
                  </div>
                  
                  <h3 className="text-md font-medium text-gray-700 mb-3">Email Triggers</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="new_order_notifications"
                        name="new_order_notifications"
                        type="checkbox"
                        checked={emailSettings.new_order_notifications}
                        onChange={handleEmailInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="new_order_notifications" className="ml-3 block text-sm font-medium text-gray-700">
                        New Order Notifications
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="order_status_updates"
                        name="order_status_updates"
                        type="checkbox"
                        checked={emailSettings.order_status_updates}
                        onChange={handleEmailInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="order_status_updates" className="ml-3 block text-sm font-medium text-gray-700">
                        Order Status Updates
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="low_inventory_alerts"
                        name="low_inventory_alerts"
                        type="checkbox"
                        checked={emailSettings.low_inventory_alerts}
                        onChange={handleEmailInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="low_inventory_alerts" className="ml-3 block text-sm font-medium text-gray-700">
                        Low Inventory Alerts
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="new_user_notifications"
                        name="new_user_notifications"
                        type="checkbox"
                        checked={emailSettings.new_user_notifications}
                        onChange={handleEmailInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="new_user_notifications" className="ml-3 block text-sm font-medium text-gray-700">
                        New User Notifications
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="send_welcome_email"
                        name="send_welcome_email"
                        type="checkbox"
                        checked={emailSettings.send_welcome_email}
                        onChange={handleEmailInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="send_welcome_email" className="ml-3 block text-sm font-medium text-gray-700">
                        Send Welcome Email to New Users
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="marketing_emails"
                        name="marketing_emails"
                        type="checkbox"
                        checked={emailSettings.marketing_emails}
                        onChange={handleEmailInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="marketing_emails" className="ml-3 block text-sm font-medium text-gray-700">
                        Enable Marketing Emails
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Save Email Settings
                    </button>
                  </div>
                </form>
              )}
              
              {/* Database Backup Settings */}
              {activeTab === 'backup' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-amber-900">Database Backup Settings</h2>
                    <button
                      type="button"
                      onClick={handleManualBackup}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Backup Now
                    </button>
                  </div>
                  
                  <div className="mb-6 bg-amber-50 p-4 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Last Backup: {formatDate(backupSettings.last_backup)}</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>Regular backups protect your coffee shop data. Enable automatic backups for peace of mind.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleBackupSettingsUpdate}>
                    <div className="mb-4 flex items-center">
                      <input
                        id="auto_backup_enabled"
                        name="auto_backup_enabled"
                        type="checkbox"
                        checked={backupSettings.auto_backup_enabled}
                        onChange={handleBackupInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto_backup_enabled" className="ml-3 block text-sm font-medium text-gray-700">
                        Enable Automatic Backups
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label htmlFor="backup_frequency" className="block text-sm font-medium text-gray-700">Backup Frequency</label>
                        <select
                          id="backup_frequency"
                          name="backup_frequency"
                          value={backupSettings.backup_frequency}
                          onChange={handleBackupInputChange}
                          disabled={!backupSettings.auto_backup_enabled}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="backup_time" className="block text-sm font-medium text-gray-700">Backup Time</label>
                        <input
                          type="time"
                          id="backup_time"
                          name="backup_time"
                          value={backupSettings.backup_time}
                          onChange={handleBackupInputChange}
                          disabled={!backupSettings.auto_backup_enabled}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="retention_days" className="block text-sm font-medium text-gray-700">Retention Period (days)</label>
                        <input
                          type="number"
                          id="retention_days"
                          name="retention_days"
                          min="1"
                          value={backupSettings.retention_days}
                          onChange={handleBackupInputChange}
                          disabled={!backupSettings.auto_backup_enabled}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Save Backup Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 