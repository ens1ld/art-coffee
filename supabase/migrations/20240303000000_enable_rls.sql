-- Enable RLS on all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create the profiles table if it doesn't exist already
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically create a profile when a new user signs up
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
  -- Add ON CONFLICT to handle cases where the profile might already exist
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is dropped if it exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run after a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create policies for the profiles table

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

-- Superadmins can update any profile including roles
CREATE POLICY "Superadmins can update any profile"
ON profiles
FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

-- Policies for the orders table

-- Users can see their own orders
CREATE POLICY "Users can see their own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
ON orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders with status 'pending'
CREATE POLICY "Users can update their pending orders"
ON orders
FOR UPDATE
USING (
  auth.uid() = user_id AND status = 'pending'
);

-- Admins and Superadmins can see all orders
CREATE POLICY "Staff can view all orders"
ON orders
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND approved = true));

-- Admins and Superadmins can update any order
CREATE POLICY "Staff can update orders"
ON orders
FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND approved = true));

-- Policies for order_items table

-- Users can see their own order items
CREATE POLICY "Users can see their own order items"
ON order_items
FOR SELECT
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Users can insert their own order items
CREATE POLICY "Users can insert their own order items"
ON order_items
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid() AND orders.status = 'pending'));

-- Admins and Superadmins can see all order items
CREATE POLICY "Staff can view all order items"
ON order_items
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND approved = true));

-- Policies for gift_cards table

-- Users can see their own gift cards
CREATE POLICY "Users can see their own gift cards"
ON gift_cards
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create gift cards
CREATE POLICY "Users can create gift cards"
ON gift_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins and Superadmins can see all gift cards
CREATE POLICY "Staff can view all gift cards"
ON gift_cards
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND approved = true));

-- Policies for loyalty_transactions table

-- Users can see their own loyalty transactions
CREATE POLICY "Users can see their own loyalty transactions"
ON loyalty_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own loyalty transactions (for redemptions)
CREATE POLICY "Users can redeem loyalty points"
ON loyalty_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND transaction_type = 'redemption'
);

-- Admins and Superadmins can see all loyalty transactions
CREATE POLICY "Staff can view all loyalty transactions"
ON loyalty_transactions
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND approved = true));

-- Admins and Superadmins can insert any loyalty transaction (awards, etc)
CREATE POLICY "Staff can manage loyalty transactions"
ON loyalty_transactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Policies for products table

-- Anyone can see products
CREATE POLICY "Anyone can see products"
ON products
FOR SELECT
USING (true);

-- Only admins and superadmins can modify products
CREATE POLICY "Staff can manage products"
ON products
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND approved = true));

-- Insert sample admin and superadmin accounts for testing
-- These are only added if they don't already exist
INSERT INTO profiles (id, email, role, approved)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@artcoffee.com', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'superadmin@artcoffee.com', 'superadmin', true)
ON CONFLICT (id) DO NOTHING; 