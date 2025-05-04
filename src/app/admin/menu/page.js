'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Menu categories
const CATEGORIES = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'pastries', name: 'Pastries' },
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'desserts', name: 'Desserts' }
];

export default function AdminMenu() {
  const { profile, isAdmin, loading } = useProfile();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'coffee',
    image_url: '',
    is_new: false,
    is_out_of_stock: false
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/not-authorized');
    }
  }, [loading, isAdmin, router]);

  // Fetch menu items
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (error) throw error;

        // Placeholder data if no menu items
        if (!data || data.length === 0) {
          const placeholderItems = [
            {
              id: 'coffee-1',
              name: 'Espresso',
              description: 'Single shot of our signature espresso blend',
              price: 2.5,
              category: 'coffee',
              image_url: '/images/espresso.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'coffee-2',
              name: 'Cappuccino',
              description: 'Espresso with steamed milk and foam',
              price: 3.8,
              category: 'coffee',
              image_url: '/images/cappuccino.jpg',
              is_new: true,
              is_out_of_stock: false
            },
            {
              id: 'tea-1',
              name: 'Earl Grey',
              description: 'Classic black tea with bergamot',
              price: 2.8,
              category: 'tea',
              image_url: '/images/earl-grey.jpg',
              is_new: false,
              is_out_of_stock: false
            },
            {
              id: 'pastry-1',
              name: 'Croissant',
              description: 'Buttery, flaky pastry',
              price: 2.5,
              category: 'pastries',
              image_url: '/images/croissant.jpg',
              is_new: false,
              is_out_of_stock: true
            },
            {
              id: 'pastry-2',
              name: 'Pain au Chocolat',
              description: 'Chocolate-filled pastry',
              price: 3.2,
              category: 'pastries',
              image_url: '/images/pain-au-chocolat.jpg',
              is_new: false,
              is_out_of_stock: false
            }
          ];
          setMenuItems(placeholderItems);
          setFilteredItems(placeholderItems);
        } else {
          setMenuItems(data);
          setFilteredItems(data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenuItems();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...menuItems];

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    setFilteredItems(result);
  }, [menuItems, categoryFilter, searchQuery]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem({
      ...editingItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission for new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newItem = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      // In a real app, this would save to the database
      const { data, error } = await supabase
        .from('products')
        .insert([newItem])
        .select();
        
      if (error) throw error;
      
      // Update UI
      if (data) {
        setMenuItems([...menuItems, data[0]]);
      } else {
        // For placeholder data
        const placeholderId = `${formData.category}-${Date.now()}`;
        const newPlaceholderItem = {
          ...newItem,
          id: placeholderId
        };
        setMenuItems([...menuItems, newPlaceholderItem]);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'coffee',
        image_url: '',
        is_new: false,
        is_out_of_stock: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item');
    }
  };

  // Handle update for editing item
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const updatedItem = {
        ...editingItem,
        price: parseFloat(editingItem.price)
      };
      
      // In a real app, this would update the database
      const { error } = await supabase
        .from('products')
        .update(updatedItem)
        .eq('id', editingItem.id);
        
      if (error) throw error;
      
      // Update UI
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item');
    }
  };

  // Handle delete menu item
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      // In a real app, this would delete from the database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update UI
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
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
            <h1 className="text-2xl font-bold text-amber-900">Menu Management</h1>
            <p className="text-gray-600">Add, edit, or remove menu items</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700"
            >
              Add New Item
            </button>
            <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="sr-only">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search menu items..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Menu Items List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500">No menu items found matching your filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <li key={item.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-12 w-12 object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-amber-900">{item.name}</h3>
                            {item.is_new && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            )}
                            {item.is_out_of_stock && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          €{item.price?.toFixed(2) || '0.00'}
                        </div>
                        <div className="flex">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="ml-2 px-2 py-1 text-xs text-amber-800 hover:text-amber-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-amber-900">
                    Add New Menu Item
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      id="price"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      id="category"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      name="image_url"
                      id="image_url"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={formData.image_url}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_new"
                        id="is_new"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        checked={formData.is_new}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="is_new" className="ml-2 block text-sm text-gray-700">Mark as New</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_out_of_stock"
                        id="is_out_of_stock"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        checked={formData.is_out_of_stock}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="is_out_of_stock" className="ml-2 block text-sm text-gray-700">Out of Stock</label>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-800 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Form Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-amber-900">
                    Edit Menu Item
                  </h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="edit-name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={editingItem.name}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="edit-description"
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={editingItem.description}
                      onChange={handleEditInputChange}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      id="edit-price"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={editingItem.price}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      id="edit-category"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={editingItem.category}
                      onChange={handleEditInputChange}
                    >
                      {CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      name="image_url"
                      id="edit-image_url"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      value={editingItem.image_url}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_new"
                        id="edit-is_new"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        checked={editingItem.is_new}
                        onChange={handleEditInputChange}
                      />
                      <label htmlFor="edit-is_new" className="ml-2 block text-sm text-gray-700">Mark as New</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_out_of_stock"
                        id="edit-is_out_of_stock"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        checked={editingItem.is_out_of_stock}
                        onChange={handleEditInputChange}
                      />
                      <label htmlFor="edit-is_out_of_stock" className="ml-2 block text-sm text-gray-700">Out of Stock</label>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      onClick={() => setEditingItem(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-800 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Update Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 