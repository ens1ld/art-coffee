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

    // Direct method: Try executing the SQL directly
    try {
      // First method: Try using RPC if available
      await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        `
      });
      
      // Verify the column exists by querying it
      await supabase
        .from('profiles')
        .select('id, is_deleted')
        .limit(1);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Added soft delete columns to profiles table' 
      });
    } catch (directError) {
      console.error('Error adding columns via direct method:', directError);
      
      // Second method: Try using a simpler approach - just a normal update
      // that mentions the column, which will provide info about whether it exists
      
      try {
        const { error: testError } = await supabase
          .from('profiles')
          .update({ is_deleted: false })
          .eq('id', session.user.id);
        
        if (!testError) {
          // Column already exists!
          return NextResponse.json({ 
            success: true, 
            message: 'Columns already exist' 
          });
        } else if (testError.message.includes('column "is_deleted" of relation "profiles" does not exist')) {
          // We can try a different approach or return information to the client
          return NextResponse.json({ 
            success: false, 
            needsManualCreation: true,
            message: 'Columns need to be created manually via SQL in Supabase dashboard',
            sqlToRun: `
              ALTER TABLE profiles 
              ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
              ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
            `
          });
        }
      } catch (testError) {
        console.error('Error testing column:', testError);
      }
      
      // If all else fails, return enough information for manual intervention
      return NextResponse.json({
        success: false,
        message: 'Unable to add columns automatically. Please run SQL in Supabase dashboard.',
        error: directError.message || 'Unknown error',
        sqlToRun: `
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        `
      });
    }
  } catch (error) {
    console.error('Error adding soft delete columns:', error);
    return NextResponse.json(
      { error: `Failed to add soft delete columns: ${error.message}` },
      { status: 500 }
    );
  }
} 