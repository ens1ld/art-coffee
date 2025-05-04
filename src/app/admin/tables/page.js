'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AdminTables() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: '',
    description: '',
    seats: '',
    location: 'main'
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch tables
  useEffect(() => {
    async function fetchTables() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .order('table_number', { ascending: true });

        if (error) throw error;

        // Placeholder data if no tables
        if (!data || data.length === 0) {
          const placeholderTables = Array(12).fill(null).map((_, i) => ({
            id: `placeholder-${i}`,
            table_number: i + 1,
            description: i < 6 ? 'Window table' : i < 10 ? 'Center table' : 'Bar seating',
            seats: i < 6 ? 4 : i < 10 ? 6 : 2,
            location: i < 8 ? 'main' : i < 10 ? 'terrace' : 'bar',
            qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://art-coffee.vercel.app/order?table=${i + 1}`,
            created_at: new Date().toISOString()
          }));
          setTables(placeholderTables);
        } else {
          setTables(data);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTables();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle add table form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.table_number) {
      errors.table_number = 'Table number is required';
    } else if (isNaN(formData.table_number) || parseInt(formData.table_number) <= 0) {
      errors.table_number = 'Table number must be a positive number';
    } else if (tables.some(t => t.table_number === parseInt(formData.table_number))) {
      errors.table_number = 'This table number already exists';
    }
    
    if (!formData.seats) {
      errors.seats = 'Seats count is required';
    } else if (isNaN(formData.seats) || parseInt(formData.seats) <= 0) {
      errors.seats = 'Seats must be a positive number';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const tableNumber = parseInt(formData.table_number);
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://art-coffee.vercel.app/order?table=${tableNumber}`;
      
      const newTable = {
        table_number: tableNumber,
        description: formData.description,
        seats: parseInt(formData.seats),
        location: formData.location,
        qr_code: qrCodeUrl
      };
      
      // In a real app, this would save to the database
      const { data, error } = await supabase
        .from('tables')
        .insert([newTable])
        .select();
        
      if (error) throw error;
      
      // Update UI
      if (data) {
        setTables([...tables, data[0]]);
      } else {
        // For placeholder data
        const placeholderId = `placeholder-${Date.now()}`;
        const newPlaceholderTable = {
          ...newTable,
          id: placeholderId,
          created_at: new Date().toISOString()
        };
        setTables([...tables, newPlaceholderTable]);
      }
      
      // Reset form
      setFormData({
        table_number: '',
        description: '',
        seats: '',
        location: 'main'
      });
      setFormErrors({});
      setSuccessMessage('Table added successfully!');
      setShowAddForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding table:', error);
      setFormErrors({ submit: error.message });
    }
  };

  // Handle table deletion
  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }
    
    try {
      // In a real app, this would update the database
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update UI
      setTables(tables.filter(table => table.id !== id));
      if (selectedTable?.id === id) {
        setSelectedTable(null);
      }
      
      setSuccessMessage('Table deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  // Get location label
  const getLocationLabel = (location) => {
    switch (location) {
      case 'main':
        return 'Main Area';
      case 'terrace':
        return 'Terrace';
      case 'bar':
        return 'Bar Area';
      default:
        return location;
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
            <h1 className="text-2xl font-bold text-amber-900">Table QR Codes</h1>
            <p className="text-gray-600">Manage tables and generate QR codes for ordering</p>
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
        
        {/* Add Table Button/Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {!showAddForm ? (
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-amber-900">Tables</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Table
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-amber-900">Add New Table</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
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
                  <label htmlFor="table_number" className="block text-sm font-medium text-gray-700">Table Number</label>
                  <input
                    type="number"
                    id="table_number"
                    name="table_number"
                    min="1"
                    value={formData.table_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {formErrors.table_number && <p className="mt-1 text-sm text-red-600">{formErrors.table_number}</p>}
                </div>
                
                <div>
                  <label htmlFor="seats" className="block text-sm font-medium text-gray-700">Number of Seats</label>
                  <input
                    type="number"
                    id="seats"
                    name="seats"
                    min="1"
                    value={formData.seats}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {formErrors.seats && <p className="mt-1 text-sm text-red-600">{formErrors.seats}</p>}
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  >
                    <option value="main">Main Area</option>
                    <option value="terrace">Terrace</option>
                    <option value="bar">Bar Area</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Window table, Corner booth"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>
                
                {formErrors.submit && <p className="md:col-span-2 text-sm text-red-600">{formErrors.submit}</p>}
                
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Add Table
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Table Grid View */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div 
                key={table.id} 
                className={`bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow ${selectedTable?.id === table.id ? 'ring-2 ring-amber-800' : ''}`}
                onClick={() => setSelectedTable(table)}
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-amber-900">Table {table.table_number}</h3>
                  <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs">
                    {table.seats} Seats
                  </span>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900">{getLocationLabel(table.location)}</p>
                    </div>
                    {table.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-sm font-medium text-gray-900">{table.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="my-6 flex justify-center">
                    <div className="relative">
                      <img 
                        src={table.qr_code} 
                        alt={`QR Code for Table ${table.table_number}`} 
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <a
                      href={table.qr_code}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      download={`table-${table.table_number}-qr.png`}
                      className="inline-flex items-center text-amber-800 hover:text-amber-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(table.id);
                      }}
                      className="inline-flex items-center text-red-600 hover:text-red-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Print Instructions */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-amber-900 mb-4">Printing Instructions</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700">1. Download the QR codes</h3>
              <p className="text-sm text-gray-500">Click the "Download" button on each table to save the QR code image.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">2. Print on suitable material</h3>
              <p className="text-sm text-gray-500">Use high-quality paper or print on sticker paper. Consider lamination for durability.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">3. Place in table stands</h3>
              <p className="text-sm text-gray-500">Insert the printed QR codes into table stands or attach to tables.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">4. Test before deploying</h3>
              <p className="text-sm text-gray-500">Scan each QR code with a mobile device to ensure it redirects to the correct ordering page.</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-md">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Tip:</span> Add a short instruction above the QR code like "Scan to order" to guide customers.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 