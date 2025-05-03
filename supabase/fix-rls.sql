-- This script fixes RLS policies to ensure users can access their profiles
-- Run this in the Supabase SQL Editor

-- Drop existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow inserting profiles" ON profiles;

-- DISABLE RLS temporarily to make sure all operations work
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create/update missing profiles for existing users
INSERT INTO profiles (id, email, role, approved, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
  CASE WHEN COALESCE(au.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE ELSE TRUE END as approved,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Enable RLS again
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to select their own profile
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create a policy that allows anyone to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can see all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
  );

-- Superadmins can update all profiles
CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Allow the service role to insert profiles
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow service role to delete profiles
CREATE POLICY "Service role can delete profiles"
  ON profiles FOR DELETE
  USING (true);

-- Create a policy for inserting profiles
CREATE POLICY "Allow inserting profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
  );

-- Check how many profiles exist
SELECT count(*) as total_profiles FROM profiles;

-- Check how many auth users without profiles
SELECT count(*) as missing_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Create a superadmin user if needed
UPDATE profiles
SET role = 'superadmin', approved = TRUE
WHERE email = 'ergi.prifti14@gmail.com';

SELECT 'RLS policies fixed!' as result; 