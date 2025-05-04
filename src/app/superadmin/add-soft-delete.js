'use client';

import { useState } from 'react';

export default function AddSoftDeleteFields({ onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [manualSql, setManualSql] = useState('');
  const [needsManual, setNeedsManual] = useState(false);

  const addSoftDeleteFields = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    setManualSql('');
    setNeedsManual(false);
    
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
      
      if (result.success) {
        setMessage(result.message || 'Successfully added soft delete fields');
        if (onComplete) onComplete();
      } else {
        // Handle case where we need manual SQL execution
        if (result.needsManualCreation && result.sqlToRun) {
          setNeedsManual(true);
          setManualSql(result.sqlToRun);
          setMessage('Database needs manual column creation via SQL Editor in Supabase dashboard.');
        } else {
          throw new Error(result.message || 'Failed to add soft delete fields');
        }
      }
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
        
        {needsManual && manualSql && (
          <div className="bg-amber-50 border border-amber-400 text-amber-800 px-4 py-3 rounded relative mb-4">
            <p className="font-medium mb-2">Please run this SQL in your Supabase SQL Editor:</p>
            <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-auto">
              {manualSql}
            </pre>
            <p className="mt-2 text-sm">
              After running this SQL, please refresh this page and try the user management again.
            </p>
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