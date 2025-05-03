'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function GiftCardPage() {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    if (!receiverEmail || !amount) {
      setStatus('Please enter both recipient and amount.');
      return;
    }

    // Temporary sender ID for demo purposes
    const senderId = '00000000-0000-0000-0000-000000000000';

    const { error } = await supabase.from('gift_cards').insert([
      {
        sender_id: senderId,
        receiver_email: receiverEmail,
        amount: parseFloat(amount),
        message,
      },
    ]);

    if (error) {
      console.error(error);
      setStatus('❌ Failed to send gift card.');
    } else {
      setStatus('✅ Gift card sent!');
      setReceiverEmail('');
      setAmount('');
      setMessage('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎁 Send a Gift Card</h1>

      <div className="grid gap-4 max-w-md">
        <input
          type="email"
          placeholder="Recipient's Email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          type="number"
          placeholder="Amount (€)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <textarea
          placeholder="Optional message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-3 py-2 rounded resize-none"
        />

        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleSend}
        >
          Send Gift Card
        </button>

        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    </div>
  );
}
