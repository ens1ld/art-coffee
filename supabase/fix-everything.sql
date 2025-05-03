-- COMPREHENSIVE FIX FOR ALL SUPABASE/DATABASE ISSUES
-- Run this script in the Supabase SQL Editor to fix ALL issues at once

-- ================ PART 1: FIX TABLES ================
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================ PART 2: DISABLE RLS TEMPORARILY ================
-- Disable RLS to ensure we can create/modify all data
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ================ PART 3: SYNC EXISTING USERS ================
-- Create profiles for all existing users without profiles
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

-- ================ PART 4: CHECK DATABASE STATE ================
-- Count users and profiles to verify
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as missing_profiles FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ================ PART 5: SETUP TRIGGER FOR NEW USERS ================
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a robust trigger function with error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the new profile with safe defaults
  INSERT INTO profiles (id, email, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE ELSE TRUE END
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error and continue
  RAISE WARNING 'Error creating user profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to execute after user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================ PART 6: RE-ENABLE AND CONFIGURE RLS ================
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Allow inserting profiles" ON profiles;

-- Create simplified but effective policies
-- 1. Allow users to view their own profile (essential)
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Allow admins and superadmins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
  );

-- 4. Allow superadmins to update any profile
CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 5. Allow authenticated users to create profiles (for self-fixing)
CREATE POLICY "Users can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================ PART 7: CREATE TEST/ADMIN ACCOUNTS ================
-- Ensure the current user (your email) has superadmin access
UPDATE profiles
SET role = 'superadmin', approved = TRUE
WHERE email ILIKE '%ergi.prifti14@gmail.com%';

-- ================ PART 8: VERIFY SETUP ================
-- Display status
SELECT 'Database setup complete! Created/verified profiles table with proper policies.' as status; 