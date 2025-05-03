'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function LoyaltyPage() {
  const [transactions, setTransactions] = useState([]);
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchLoyaltyData(session.user.id);
      }
      
      setLoading(false);
    };
    
    getUser();
  }, []);

  const fetchLoyaltyData = async (userId) => {
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

  const redeemPoints = async (pointsToRedeem, reward) => {
    if (points < pointsToRedeem) {
      setStatus(`❌ You need at least ${pointsToRedeem} points to redeem this reward.`);
      return;
    }

    const { error } = await supabase.from('loyalty_transactions').insert([
      {
        user_id: user.id,
        points: -pointsToRedeem,
        description: `Redeemed for ${reward}`,
      },
    ]);

    if (error) {
      setStatus('❌ Redemption failed.');
    } else {
      setStatus(`✅ ${pointsToRedeem} points redeemed for ${reward}!`);
      setPoints((prev) => prev - pointsToRedeem);
      
      // Refresh transaction list
      await fetchLoyaltyData(user.id);
    }
  };

  const loyaltyBenefits = [
    { points: 10, reward: "Free Coffee", description: "Any small coffee of your choice" },
    { points: 25, reward: "Free Pastry", description: "Any pastry from our selection" },
    { points: 50, reward: "Coffee Bundle", description: "3 coffees of your choice" },
    { points: 100, reward: "VIP Status", description: "Priority service and exclusive offers for 1 month" },
  ];

  const howItWorks = [
    { title: "Sign Up", description: "Create an account to start earning points" },
    { title: "Earn Points", description: "Get 1 point for every dollar spent" },
    { title: "Extra Points", description: "Double points on Mondays and your birthday" },
    { title: "Redeem Rewards", description: "Use your points for free items and special offers" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-grow container-custom py-12">
        <h1 className="heading-2 mb-4 text-center">Art Coffee Loyalty Program</h1>
        
        <section className="mb-16">
          <div className="bg-[#F9F5F0] rounded-lg p-8 mb-8">
            <h2 className="heading-3 mb-4">How Our Loyalty Program Works</h2>
            <p className="paragraph mb-6">
              Join our loyalty program and earn points with every purchase. Redeem your points for free coffee, pastries, and exclusive rewards.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mb-3">
                    {index + 1}
                  </div>
                  <h3 className="font-medium text-lg mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <h2 className="heading-3 mb-4">Available Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loyaltyBenefits.map((benefit, index) => (
              <div key={index} className="border border-border rounded-lg p-6 hover:shadow-card-hover transition-all">
                <div className="flex gap-2 items-center mb-3">
                  <div className="bg-primary/10 text-primary font-bold rounded-full w-12 h-12 flex items-center justify-center">
                    {benefit.points}
                  </div>
                  <span className="font-medium">points</span>
                </div>
                <h3 className="font-medium text-lg mb-2">{benefit.reward}</h3>
                <p className="text-text-secondary text-sm mb-4">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {!user ? (
          <div className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-xl font-medium mb-4">Sign in to view your loyalty points and redeem rewards</h2>
            <p className="text-text-secondary mb-6">
              Create an account or log in to start earning and redeeming loyalty points with every purchase.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login?redirectTo=/loyalty" className="btn-primary">
                Log In
              </Link>
              <Link href="/signup" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <section className="bg-[#F9F5F0] rounded-lg p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="heading-3 mb-2">Your Loyalty Points</h2>
                <p className="text-xl font-medium text-primary">
                  {loading ? 'Loading...' : `${points} points available`}
                </p>
              </div>
              
              {status && (
                <div className={`mt-4 md:mt-0 p-3 rounded ${status.includes('✅') ? 'bg-success/10' : 'bg-error/10'}`}>
                  {status}
                </div>
              )}
            </div>
            
            <h3 className="font-medium text-lg mb-4">Redeem Your Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {loyaltyBenefits.map((benefit, index) => (
                <div key={index} className="border border-border bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{benefit.reward}</h4>
                    <span className="text-primary font-bold">{benefit.points} pts</span>
                  </div>
                  <p className="text-text-secondary text-sm mb-3">{benefit.description}</p>
                  <button
                    onClick={() => redeemPoints(benefit.points, benefit.reward)}
                    disabled={points < benefit.points || loading}
                    className={`w-full py-2 rounded text-center ${
                      points >= benefit.points
                        ? 'bg-primary text-white hover:bg-primary-light'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
            
            <h3 className="font-medium text-lg mb-4">Transaction History</h3>
            {loading ? (
              <p>Loading your transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{tx.description}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${tx.points > 0 ? 'text-success' : 'text-primary'}`}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-text-secondary bg-white border border-border rounded-lg">
                You don't have any transactions yet. Start shopping to earn points!
              </p>
            )}
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
