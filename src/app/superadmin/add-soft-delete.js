'use client';

import { useState } from 'react';

export default function AddSoftDeleteFields({ onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const addSoftDeleteFields = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/add-soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add soft delete fields');
      }
      
      setMessage(result.message || 'Successfully added soft delete fields');
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error adding soft delete fields:', error);
      setError('Failed to add soft delete fields: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-amber-900">Database Maintenance</h2>
        </div>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <p className="text-gray-600 mb-4">
          This operation will add soft delete capability to the user management system.
          It&apos;s required for the user deletion feature to work properly.
        </p>
        
        <button
          onClick={addSoftDeleteFields}
          disabled={isLoading}
          className="w-full text-center px-4 py-2 border border-amber-800 text-amber-800 rounded-md hover:bg-amber-50 disabled:opacity-50"
        >
          {isLoading ? 'Adding Fields...' : 'Add Soft Delete Fields'}
        </button>
      </div>
    </div>
  );
} 