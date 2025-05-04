import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This is a one-time setup API to create a useful RPC function
export async function POST(request) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // First verify the user is a superadmin
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

    // SQL to create the RPC function for marking users as deleted
    const createRpcFunctionSql = `
      -- Create a function to mark a user as deleted
      CREATE OR REPLACE FUNCTION mark_user_deleted(user_id UUID)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- First try with the new columns
        BEGIN
          UPDATE profiles
          SET is_deleted = true,
              deleted_at = NOW(),
              email = 'deleted_' || substr(user_id::text, 1, 8) || '@deleted.user',
              role = 'deleted'
          WHERE id = user_id;
        EXCEPTION
          WHEN undefined_column THEN
            -- If columns don't exist, just update role and email
            UPDATE profiles
            SET email = 'deleted_' || substr(user_id::text, 1, 8) || '@deleted.user',
                role = 'deleted'
            WHERE id = user_id;
        END;
      END;
      $$;
    `;

    // Try to create the RPC function
    try {
      await supabase.rpc('exec_sql', {
        sql_query: createRpcFunctionSql
      });
      
      return NextResponse.json({
        success: true,
        message: 'RPC function created successfully'
      });
    } catch (error) {
      console.error('Error creating RPC function via exec_sql:', error);
      
      // If the above fails, the user still needs to run the SQL manually
      return NextResponse.json({
        success: false,
        message: 'Could not create the RPC function automatically',
        error: error.message,
        sqlToRun: createRpcFunctionSql
      });
    }
  } catch (error) {
    console.error('Error in create-rpc-function route:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 