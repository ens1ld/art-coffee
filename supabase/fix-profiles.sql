-- This script fixes missing profiles for existing users
-- Run this in the Supabase SQL Editor

-- First, create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add ON CONFLICT DO NOTHING to avoid errors if records already exist
INSERT INTO profiles (id, email, role, approved, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
  TRUE as approved,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow inserting profiles" ON profiles;

-- Create basic RLS policies
-- Allow users to view their own profile
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins and superadmins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
  );

-- Allow superadmins to update all profiles
CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Allow inserting profiles for any authenticated user
CREATE POLICY "Allow inserting profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
  );

-- Create a robust trigger function with better error handling and default values
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT;
  should_approve BOOLEAN;
BEGIN
  -- Get role from metadata if it exists, default to 'user'
  BEGIN
    default_role := COALESCE(
      NEW.raw_user_meta_data->>'role', 
      'user'
    );
  EXCEPTION WHEN OTHERS THEN
    default_role := 'user';
  END;
  
  -- Set approval based on role
  should_approve := CASE 
    WHEN default_role = 'admin' THEN FALSE
    ELSE TRUE
  END;
  
  -- Insert the new profile with safe defaults for all fields
  INSERT INTO profiles (
    id, 
    email, 
    role, 
    approved, 
    created_at, 
    updated_at
  ) 
  VALUES (
    NEW.id, 
    NEW.email, 
    default_role, 
    should_approve, 
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error to the Postgres logs and continue
  RAISE NOTICE 'Error creating profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a new trigger that fires AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Show how many profiles were created
SELECT count(*) as profiles_created 
FROM profiles;

-- Create a superadmin if you need one (replace with your email)
UPDATE profiles
SET role = 'superadmin', approved = TRUE
WHERE email = 'superadm.artcoffee@gmail.com';

SELECT 'Profile issues fixed!' as result; 