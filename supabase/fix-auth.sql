-- This script fixes authentication issues
-- Run this in the Supabase SQL Editor

-- First, drop and recreate the trigger function with the correct fields
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a single, correct trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, approved, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'admin' THEN FALSE
      ELSE TRUE
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a policy to allow inserts into profiles
DROP POLICY IF EXISTS "Allow insert for all" ON profiles;
CREATE POLICY "Allow insert for all"
  ON profiles 
  FOR INSERT
  WITH CHECK (true);

-- Check if the profiles table has the right structure
DO $$
BEGIN
  -- Add the approved column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'profiles' AND column_name = 'approved') THEN
    ALTER TABLE profiles ADD COLUMN approved BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Show a success message
SELECT 'Authentication system fixed!' as result; 