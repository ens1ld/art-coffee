'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/components/ProfileFetcher';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SuperadminManageUsers() {
  const { profile, loading, error } = useProfile();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is superadmin
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== 'superadmin') {
        router.push('/not-authorized');
      }
    }
  }, [loading, profile, router]);

  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Placeholder data if no users
        if (!data || data.length === 0) {
          const roles = ['user', 'admin', 'superadmin'];
          const placeholderUsers = Array(20).fill(null).map((_, i) => {
            const role = roles[Math.floor(Math.random() * (i === 0 ? 3 : (i < 3 ? 2 : 1)))]; // Ensure at least one of each role
            return {
              id: `placeholder-${i}`,
              email: `user${i}@example.com`,
              role: role,
              created_at: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
              approved: role === 'admin' ? Math.random() > 0.3 : true,
              last_sign_in: Math.random() > 0.2 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() : null
            };
          });
          setUsers(placeholderUsers);
          setFilteredUsers(placeholderUsers);
        } else {
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorMessage('Failed to fetch users: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (profile && profile.role === 'superadmin') {
      fetchUsers();
    }
  }, [profile]);

  // Apply filters
  useEffect(() => {
    let result = [...users];

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        (user.email && user.email.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(result);
  }, [users, roleFilter, searchQuery]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    
    try {
      // For the current user (superadmin), prevent downgrading themselves
      if (userId === profile.id && newRole !== 'superadmin') {
        setErrorMessage("You cannot downgrade your own superadmin role.");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          // Auto-approve admins if set by superadmin
          approved: newRole === 'admin' ? true : undefined
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole, approved: newRole === 'admin' ? true : user.approved } : user
      ));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({...selectedUser, role: newRole, approved: newRole === 'admin' ? true : selectedUser.approved});
      }
      
      setSuccessMessage(`User role updated to ${newRole}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setErrorMessage('Failed to update user role: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle approval status change
  const handleApprovalChange = async (userId, approved) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, approved } : user
      ));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({...selectedUser, approved});
      }
      
      setSuccessMessage(`User ${approved ? 'approved' : 'unapproved'} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating user approval status:', error);
      setErrorMessage('Failed to update approval status: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    // Prevent deleting themselves
    if (userId === profile.id) {
      setErrorMessage("You cannot delete your own account.");
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      
      setSuccessMessage('User deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('Failed to delete user: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

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

  // Get role badge color
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-amber-100 text-amber-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl font-bold text-amber-900">User Management</h1>
            <p className="text-gray-600">Manage all users, roles, and permissions</p>
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
        
        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="sr-only">Search Users</label>
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
                  placeholder="Search users by email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="role_filter" className="block text-sm font-medium text-gray-700 mr-2">Role:</label>
              <select
                id="role_filter"
                name="role_filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="superadmin">Superadmins</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* User List and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user.id}
                          className={`${selectedUser?.id === user.id ? 'bg-amber-50' : 'hover:bg-gray-50'} cursor-pointer`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.role === 'admin' && (
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {user.approved ? 'Approved' : 'Pending'}
                              </span>
                            )}
                            {user.role !== 'admin' && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {user.last_sign_in ? 'Active' : 'Never Logged In'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-amber-600 hover:text-amber-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
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
          
          {/* User Details */}
          <div>
            {selectedUser ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-medium text-amber-900">User Details</h2>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">User ID</h4>
                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedUser.id}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Role</h4>
                    <div className="mt-1">
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </div>
                  </div>
                  
                  {selectedUser.role === 'admin' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Admin Status</h4>
                      <div className="mt-1">
                        <select
                          value={selectedUser.approved ? 'approved' : 'pending'}
                          onChange={(e) => handleApprovalChange(selectedUser.id, e.target.value === 'approved')}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending Approval</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Created</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Sign In</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.last_sign_in)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // In a real app, this would implement a reset password functionality
                        alert(`Reset password email would be sent to ${selectedUser.email}`);
                      }}
                      className="w-full text-center px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50"
                    >
                      Reset Password
                    </button>
                    
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="w-full text-center px-4 py-2 border border-red-800 text-red-800 rounded-md hover:bg-red-50"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No user selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a user from the list to view and manage details.
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