'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ApproveAdminsPage() {
  const [loading, setLoading] = useState(true);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  // Fetch pending admin accounts
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }
      
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!currentUserProfile || currentUserProfile.role !== 'superadmin') {
        router.push('/not-authorized');
        return;
      }
      
      await fetchPendingAdmins();
    };
    
    checkSession();
  }, [router]);

  const fetchPendingAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .eq('approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPendingAdmins(data || []);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      setMessage({ type: 'error', text: 'Failed to load pending admin accounts.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    try {
      setActionLoading(adminId);
      setMessage({ type: '', text: '' });
      
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', adminId);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Admin account has been approved successfully.' });
      await fetchPendingAdmins();
    } catch (error) {
      console.error('Error approving admin:', error);
      setMessage({ type: 'error', text: 'Failed to approve admin. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (adminId) => {
    try {
      setActionLoading(adminId);
      setMessage({ type: '', text: '' });
      
      // Delete the profile (this will trigger cascade delete in auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Admin account has been denied and removed.' });
      await fetchPendingAdmins();
    } catch (error) {
      console.error('Error denying admin:', error);
      setMessage({ type: 'error', text: 'Failed to deny admin. Please try again.' });
    } finally {
      setActionLoading(null);
    }
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
      
      <div className="container-custom py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-1">Pending Admin Approvals</h1>
          <button 
            onClick={() => router.push('/superadmin')} 
            className="btn-outline flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
          }`}>
            <p>{message.text}</p>
          </div>
        )}
        
        {pendingAdmins.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="paragraph">No pending admin approvals at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingAdmins.map((admin) => (
              <div key={admin.id} className="card p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">{admin.email}</h3>
                    <p className="text-text-secondary text-sm">
                      Requested on {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeny(admin.id)}
                      disabled={actionLoading === admin.id}
                      className={`btn-outline-error ${actionLoading === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {actionLoading === admin.id ? 'Processing...' : 'Deny'}
                    </button>
                    <button
                      onClick={() => handleApprove(admin.id)}
                      disabled={actionLoading === admin.id}
                      className={`btn-primary ${actionLoading === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {actionLoading === admin.id ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 