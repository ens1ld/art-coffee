import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Create a Supabase client with the cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // First verify the current user is a superadmin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the current user's role
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || currentUserProfile?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Return a message that user deletion is disabled
    return NextResponse.json(
      { error: 'User deletion is currently disabled' },
      { status: 403 }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
} 