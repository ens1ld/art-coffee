-- This script fixes missing profiles for existing users
-- Run this in the Supabase SQL Editor

-- 1. Create profiles for any users that don't have one
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
WHERE p.id IS NULL;

-- 2. Ensure RLS policies allow users to select their own profile
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 3. Show how many profiles were created
SELECT count(*) as profiles_created 
FROM profiles;

-- 4. Create a superadmin if you need one (replace with your email)
UPDATE profiles
SET role = 'superadmin', approved = TRUE
WHERE email = 'ergi.prifti14@gmail.com';

SELECT 'Profile issues fixed!' as result; 