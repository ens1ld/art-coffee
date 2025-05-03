-- Enable Row Level Security on all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Policies for orders table
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and superadmins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins and superadmins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Policies for order_items table
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and superadmins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Policies for gift_cards table
CREATE POLICY "Users can view their own gift cards"
  ON gift_cards FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can insert their own gift cards"
  ON gift_cards FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins and superadmins can view all gift cards"
  ON gift_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Policies for loyalty_transactions table
CREATE POLICY "Users can view their own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and superadmins can view all loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins and superadmins can insert loyalty transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
    OR auth.uid() = user_id
  );

-- Policies for products table
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins and superadmins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins and superadmins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- END OF FILE (removing the dangling SQL fragment)   