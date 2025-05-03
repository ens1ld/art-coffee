'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(true);
  const [pendingAdminsCount, setPendingAdminsCount] = useState(0);
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0
  });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth');
          return;
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile || profile.role !== 'superadmin') {
          router.push('/not-authorized');
          return;
        }
        
        // Fetch count of pending admin approvals
        const { data: pendingAdmins, error: pendingError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .eq('approved', false);
        
        if (!pendingError) {
          setPendingAdminsCount(pendingAdmins?.length || 0);
        }
        
        // Fetch basic stats
        await fetchStats();
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        router.push('/auth');
      }
    };
    
    checkSession();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      // Get orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });
      
      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });
      
      // Get revenue (mock calculation - replace with actual logic)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');
      
      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      setStats({
        users: usersCount || 0,
        orders: ordersCount || 0,
        products: productsCount || 0,
        revenue: revenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        <h1 className="heading-1 mb-8">Superadmin Dashboard</h1>
        
        {pendingAdminsCount > 0 && (
          <Link href="/superadmin/approve-admins" className="mb-8 p-4 bg-warning/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-warning">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="font-medium">{pendingAdminsCount} pending admin approval{pendingAdminsCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-primary font-medium">Review Now →</div>
          </Link>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-text-secondary mb-1">Total Users</h3>
            <p className="text-3xl font-semibold">{stats.users}</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-text-secondary mb-1">Total Orders</h3>
            <p className="text-3xl font-semibold">{stats.orders}</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-text-secondary mb-1">Total Products</h3>
            <p className="text-3xl font-semibold">{stats.products}</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-text-secondary mb-1">Total Revenue</h3>
            <p className="text-3xl font-semibold">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/superadmin/approve-admins" className="card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Manage Admins</h3>
            <p className="text-text-secondary mb-4">Approve or deny admin account requests</p>
            <div className="text-primary font-medium mt-auto">Manage →</div>
          </Link>
          
          <Link href="/superadmin/users" className="card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Manage Users</h3>
            <p className="text-text-secondary mb-4">View and update user information</p>
            <div className="text-primary font-medium mt-auto">Manage →</div>
          </Link>
          
          <Link href="/superadmin/system" className="card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">System Settings</h3>
            <p className="text-text-secondary mb-4">Configure application settings</p>
            <div className="text-primary font-medium mt-auto">Configure →</div>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
