import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const requestData = await request.json();
    const { userId } = requestData;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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
    
    // Make sure user is not trying to delete themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // First, soft-delete by updating the profile status to indicate deletion
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        // Anonymize the data for privacy
        email: `deleted_${userId.substring(0, 8)}@deleted.user`,
        role: 'deleted' 
      })
      .eq('id', userId);

    if (profileUpdateError) {
      return NextResponse.json(
        { error: `Failed to delete user profile: ${profileUpdateError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: `Failed to delete user: ${error.message}` },
      { status: 500 }
    );
  }
} 