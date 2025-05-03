/*
=============================================================
                HOW TO RUN THIS SCRIPT
=============================================================

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project 
3. Go to the "SQL Editor" in the left sidebar
4. Click "New Query" button
5. Copy and paste the ENTIRE contents of this file
6. IMPORTANT: Replace 'your.email@example.com' in the script below
   with the email address you want to assign as superadmin
7. Click "Run" to execute the script
8. You should see "RECURSIVE POLICY FIX COMPLETED SUCCESSFULLY"

This script will:
- Temporarily disable Row Level Security
- Drop existing problematic policies
- Create new non-recursive policies
- Fix any missing profiles
- Make your email a superadmin

=============================================================
*/

-- EMERGENCY FIX for infinite recursion in RLS policies
-- Run this script in the Supabase SQL Editor IMMEDIATELY
-- IMPORTANT: This script will fix the "infinite recursion detected in policy for relation 'profiles'" error

-- ========== STEP 1: DISABLE ROW LEVEL SECURITY TEMPORARILY ==========
-- This will prevent errors while we fix the policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ========== STEP 2: DROP ALL RECURSIVE POLICIES ==========
-- Remove all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow inserting profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can delete profiles" ON profiles;

-- ========== STEP 3: CHECK FOR MISSING PROFILES ==========
-- First check how many users don't have profiles
SELECT count(*) as missing_profiles 
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Insert profiles for any missing users
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

-- ========== STEP 4: ADD NON-RECURSIVE POLICIES ==========
-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic user SELECT policy - no recursion possible
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Basic user UPDATE policy - no recursion possible
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin SELECT policy using metadata directly - AVOIDS RECURSION
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'superadmin')
  );

-- Superadmin UPDATE policy using metadata directly - AVOIDS RECURSION
CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'superadmin'
  );

-- Basic INSERT policy - no recursion possible
CREATE POLICY "Users can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========== STEP 5: VERIFY THE FIX ==========
-- Test a query that would normally cause recursion
SELECT count(*) FROM profiles WHERE 
  id = auth.uid() OR
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'superadmin';

-- ========== IMPORTANT: UPDATE YOUR ADMIN/SUPERADMIN USER ==========
-- REPLACE 'your.email@example.com' with your actual email address
UPDATE profiles
SET role = 'superadmin', approved = TRUE
WHERE email = 'superadm.artcoffee@gmail.com';
-- After running this script, sign in with this email to access superadmin features

SELECT 'RECURSIVE POLICY FIX COMPLETED SUCCESSFULLY' as result; 

SELECT * FROM profiles WHERE id = auth.uid(); 

SELECT * FROM profiles LIMIT 1; 