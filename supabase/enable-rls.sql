-- This script enables Row Level Security on all tables
-- Run this in the Supabase SQL Editor after creating the tables

-- Enable RLS on all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile except role" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update approved status for admin accounts" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update any profile" ON profiles;

-- Policies for profiles table

-- Everyone can see their own profile
CREATE POLICY "Users can see their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile but not change role
CREATE POLICY "Users can update their own profile except role"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- Admins can update approved status for admin accounts
CREATE POLICY "Admins can update approved status for admin accounts"
ON profiles
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  AND (SELECT role FROM profiles WHERE id = profiles.id) = 'admin'
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  AND (SELECT role FROM profiles WHERE id = profiles.id) = 'admin'
);

-- Superadmins can update any profile
CREATE POLICY "Superadmins can update any profile"
ON profiles
FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

-- Insert sample admin and superadmin accounts for testing
-- These are only added if they don't already exist
INSERT INTO profiles (id, email, role, approved)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@artcoffee.com', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'superadm.artcoffee@gmail.com', 'superadmin', true)
ON CONFLICT (id) DO NOTHING; 

-- Report on the newly enabled RLS
SELECT 'Row Level Security enabled successfully' as result; 