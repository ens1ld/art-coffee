'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function GiftCardPage() {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState(25);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
  }, []);

  const giftCardDesigns = [
    { id: 0, name: "Classic Coffee", image: "/images/gift-card-1.jpg", color: "bg-[#8B4513]" },
    { id: 1, name: "Morning Brew", image: "/images/gift-card-2.jpg", color: "bg-[#A67C52]" },
    { id: 2, name: "Coffee Beans", image: "/images/gift-card-3.jpg", color: "bg-[#5A4020]" },
    { id: 3, name: "Premium Gold", image: "/images/gift-card-4.jpg", color: "bg-[#E3A95C]" },
  ];

  const amountOptions = [15, 25, 50, 100];

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setStatus('login-required');
      return;
    }
    
    if (!receiverEmail || !amount) {
      setStatus('error');
      return;
    }

    setStatus('processing');

    try {
      const { error } = await supabase.from('gift_cards').insert([
        {
          sender_id: user.id,
          receiver_email: receiverEmail,
          amount: parseFloat(amount),
          message,
          design_id: selectedDesign
        },
      ]);

      if (error) throw error;
      
      setStatus('success');
      setReceiverEmail('');
      setAmount(25);
      setMessage('');
      setSelectedDesign(0);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-grow container-custom py-12">
        <h1 className="heading-2 mb-4 text-center">Art Coffee Gift Cards</h1>
        
        <div className="text-center mb-10">
          <p className="paragraph max-w-3xl mx-auto">
            Gift the perfect brew! Share the Art Coffee experience with friends, family, or colleagues.
            Our digital gift cards are delivered instantly and can be used for any in-store or online purchase.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="heading-3 mb-6">Gift Card Designs</h2>
            <div className="grid grid-cols-2 gap-4">
              {giftCardDesigns.map((design) => (
                <div 
                  key={design.id}
                  onClick={() => setSelectedDesign(design.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedDesign === design.id ? 'border-primary shadow-lg scale-105' : 'border-transparent'
                  }`}
                >
                  <div className="aspect-[3/2] bg-gray-200 relative">
                    {/* Replace with actual gift card images */}
                    <div className={`w-full h-full ${design.color} flex items-center justify-center`}>
                      <div className="text-white text-center p-4">
                        <h3 className="font-serif text-lg font-bold mb-1">Art Coffee</h3>
                        <p className="text-sm">{design.name}</p>
                      </div>
                    </div>
                  </div>
                  {selectedDesign === design.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="heading-3 mb-6">Customize Your Gift</h2>
            
            {status === 'login-required' && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg">
                <h3 className="font-medium text-lg text-primary mb-2">Authentication Required</h3>
                <p className="text-text-secondary mb-4">
                  Please log in or create an account to purchase a gift card.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/login?redirectTo=/gift-card" className="btn-primary">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-secondary">
                    Create Account
                  </Link>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg">
                <h3 className="font-medium text-lg text-success mb-2">Gift Card Sent Successfully!</h3>
                <p className="text-text-secondary">
                  Your gift card has been sent to the recipient&apos;s email.
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
                <h3 className="font-medium text-lg text-error mb-2">Error Sending Gift Card</h3>
                <p className="text-text-secondary">
                  Please check all fields and try again.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label htmlFor="amount" className="label">Select Amount</label>
                <div className="grid grid-cols-4 gap-3">
                  {amountOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAmount(option)}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        amount === option
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="label">Recipient&apos;s Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="label">Personal Message (Optional)</label>
                <textarea
                  id="message"
                  placeholder="Add a personal note..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
                disabled={status === 'processing'}
              >
                {status === 'processing' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Purchase Gift Card
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="bg-[#F9F5F0] rounded-lg p-8">
          <h2 className="heading-3 mb-4 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Choose & Customize</h3>
              <p className="text-text-secondary">Select a design, amount, and add a personal message.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Instant Delivery</h3>
              <p className="text-text-secondary">The gift card is delivered to your recipient&apos;s email.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Easy to Redeem</h3>
              <p className="text-text-secondary">Recipients can use the code online or in-store.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
