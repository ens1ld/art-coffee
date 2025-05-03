-- This script fixes issues with missing profiles
-- Run this in the Supabase SQL Editor to repair your database

-- 1. Create missing profiles for existing users
INSERT INTO profiles (id, email, role, approved)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
  CASE 
    WHEN COALESCE(au.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE
    ELSE TRUE
  END as approved
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Fix the trigger function to properly create profiles for new users
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, approved)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE
      ELSE TRUE
    END
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Report on the number of profiles we've fixed
SELECT COUNT(*) as profiles_created FROM profiles; 