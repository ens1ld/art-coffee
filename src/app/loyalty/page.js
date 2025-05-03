'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoyaltyPage() {
  const [transactions, setTransactions] = useState([]);
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState('');

  // TEMP: simulate a logged-in user
  const userId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTransactions(data);
        const totalPoints = data.reduce((sum, tx) => sum + tx.points, 0);
        setPoints(totalPoints);
      }
    };

    fetchLoyaltyData();
  }, []);

  const redeemPoints = async () => {
    if (points < 10) {
      setStatus('❌ You need at least 10 points to redeem.');
      return;
    }

    const { error } = await supabase.from('loyalty_transactions').insert([
      {
        user_id: userId,
        points: -10,
        description: 'Redeemed for free coffee',
      },
    ]);

    if (error) {
      setStatus('❌ Redemption failed.');
    } else {
      setStatus('✅ 10 points redeemed!');
      setPoints((prev) => prev - 10);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎯 Loyalty Program</h1>

      <p className="text-lg mb-4">Total Points: <strong>{points}</strong></p>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={redeemPoints}
      >
        Redeem 10 Points
      </button>

      {status && <p className="mt-2 text-sm">{status}</p>}

      <h2 className="mt-6 text-xl font-semibold">🧾 Transaction History</h2>
      <ul className="mt-2 space-y-2">
        {transactions.map((tx) => (
          <li key={tx.id} className="border p-2 rounded">
            <span>{tx.description}</span> — <strong>{tx.points} pts</strong>
            <div className="text-xs text-gray-500">
              {new Date(tx.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
