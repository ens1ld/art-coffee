-- This is a complete setup script for the database
-- Run this in the Supabase SQL Editor

-- ==================== PART 1: CREATE TABLES ====================

-- 1. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create the gift_cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  remaining_balance DECIMAL(10, 2) NOT NULL,
  recipient_email TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create the loyalty_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== PART 2: SETUP USER TRIGGER ====================

-- 7. Create the trigger function to automatically create profiles
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

-- 8. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==================== PART 3: ENABLE RLS ====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- ==================== PART 4: CREATE POLICIES ====================

-- Profiles table policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile except role" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update any profile" ON profiles;

-- Create policies
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile except role"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Superadmins can update any profile"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

-- ==================== PART 5: CREATE EXISTING USERS' PROFILES ====================

-- Create profiles for any existing users that don't have one
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

-- ==================== COMPLETED ====================

SELECT 'Database setup completed successfully!' as result; 