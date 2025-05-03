'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PendingApprovalPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }
      
      setUserEmail(session.user.email);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', session.user.id)
        .single();
      
      if (!profile) {
        router.push('/auth');
        return;
      }
      
      // If not an admin or already approved, redirect appropriately
      if (profile.role !== 'admin' || profile.approved) {
        switch (profile.role) {
          case 'superadmin':
            router.push('/superadmin');
            break;
          case 'admin':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
        return;
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg text-center">
          <div className="card">
            <h1 className="heading-2 mb-6">Admin Approval Pending</h1>
            
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-warning">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <p className="paragraph mb-4">
                Your admin account for <span className="font-bold">{userEmail}</span> is currently pending approval from a superadmin.
              </p>
              
              <p className="paragraph mb-4">
                You will be notified via email once your account has been approved. After approval, you will be able to access the admin dashboard and manage orders, products, and other business operations.
              </p>
              
              <p className="paragraph text-text-secondary">
                If you believe this is an error or have questions, please contact the system administrator.
              </p>
            </div>
            
            <button onClick={handleSignOut} className="btn-outline w-full">
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 