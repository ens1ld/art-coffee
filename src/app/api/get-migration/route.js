import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the migration SQL
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240101000000_create_profiles_table.sql');
    
    // Fallback if file doesn't exist
    let sql = '';
    
    if (fs.existsSync(migrationPath)) {
      sql = fs.readFileSync(migrationPath, 'utf8');
    } else {
      // Hardcoded SQL if file doesn't exist
      sql = `
-- Create profiles table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT CHECK (role IN ('user', 'admin', 'superadmin')) DEFAULT 'user',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get role without causing recursion
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM auth.users
    LEFT JOIN auth.jwt() as jwt ON auth.uid() = jwt.sub
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile except role" ON profiles;
DROP POLICY IF EXISTS "Temporary policy for debugging" ON profiles;

-- Create policies for accessing profiles
-- Users can see their own profile
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role and approved)
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT get_auth_role()) AND
    approved = (SELECT approved FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    get_auth_role() IN ('admin', 'superadmin')
  );

-- Superadmins can update any profile
CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    get_auth_role() = 'superadmin'
  );

-- Temporary policy for debugging (will be removed in production)
CREATE POLICY "Temporary policy for debugging"
  ON profiles FOR SELECT
  USING (true);

-- Create a trigger function to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, approved)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE
      ELSE TRUE
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users that don't have one yet
INSERT INTO profiles (id, email, role, approved, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
  CASE 
    WHEN COALESCE(au.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE
    ELSE TRUE
  END as approved,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
      `;
    }
    
    return NextResponse.json({ 
      sql,
      migrationPath,
      fileExists: fs.existsSync(migrationPath)
    });
  } catch (error) {
    console.error('Error serving migration:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 