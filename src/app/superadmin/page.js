'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SuperadminPanel() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (!error) setUsers(data);
    };
    fetchUsers();
  }, []);

  const resetPoints = async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ loyalty_points: 0 })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, loyalty_points: 0 } : u
        )
      );
      setStatus('✅ Points reset for user ' + userId);
    } else {
      setStatus('❌ Error resetting points.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛠️ Superadmin Panel</h1>

      {status && <p className="mb-4 text-sm">{status}</p>}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">User ID</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Points</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2 border">{user.id}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.loyalty_points}</td>
              <td className="p-2 border">
                <button
                  onClick={() => resetPoints(user.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reset Points
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
