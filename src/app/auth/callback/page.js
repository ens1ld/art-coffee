'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Get user profile to determine role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            // Redirect based on role
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
          } else {
            router.push('/');
          }
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="heading-2 mb-4">Verifying your email...</h1>
          <p className="paragraph mb-6">Please wait while we complete the verification process.</p>
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 