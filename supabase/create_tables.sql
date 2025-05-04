-- Create necessary tables for the order system
-- Run this script in Supabase SQL Editor

-- Create orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'orders'
  ) THEN
    CREATE TABLE orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      status TEXT NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      table_number INTEGER,
      customer_name TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'Created orders table';
  ELSE
    RAISE NOTICE 'Orders table already exists';
  END IF;
END $$;

-- Create order_items table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'order_items'
  ) THEN
    CREATE TABLE order_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'Created order_items table';
  ELSE
    RAISE NOTICE 'Order_items table already exists';
  END IF;
END $$;

-- Create loyalty_transactions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'loyalty_transactions'
  ) THEN
    CREATE TABLE loyalty_transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      points INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      reference_id UUID,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'Created loyalty_transactions table';
  ELSE
    RAISE NOTICE 'Loyalty_transactions table already exists';
  END IF;
END $$;

-- Create RLS policies for orders table
DO $$
BEGIN
  -- RLS policies for orders
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'orders'
  ) THEN
    -- Enable RLS on orders
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
    DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
    DROP POLICY IF EXISTS "Users can create orders" ON orders;
    DROP POLICY IF EXISTS "Admins can update orders" ON orders;
    
    -- Create new policies
    CREATE POLICY "Users can view their own orders" 
      ON orders FOR SELECT 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Admins can view all orders" 
      ON orders FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
      );
      
    CREATE POLICY "Users can create orders" 
      ON orders FOR INSERT 
      WITH CHECK (true);
      
    CREATE POLICY "Admins can update orders" 
      ON orders FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
      );
      
    RAISE NOTICE 'Created RLS policies for orders table';
  END IF;
  
  -- RLS policies for order_items
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'order_items'
  ) THEN
    -- Enable RLS on order_items
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
    DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
    DROP POLICY IF EXISTS "Users can create order items" ON order_items;
    
    -- Create new policies
    CREATE POLICY "Users can view their own order items" 
      ON order_items FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = order_items.order_id
          AND orders.user_id = auth.uid()
        )
      );
      
    CREATE POLICY "Admins can view all order items" 
      ON order_items FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
      );
      
    CREATE POLICY "Users can create order items" 
      ON order_items FOR INSERT 
      WITH CHECK (true);
      
    RAISE NOTICE 'Created RLS policies for order_items table';
  END IF;
  
  -- RLS policies for loyalty_transactions
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'loyalty_transactions'
  ) THEN
    -- Enable RLS on loyalty_transactions
    ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own loyalty transactions" ON loyalty_transactions;
    DROP POLICY IF EXISTS "Admins can view all loyalty transactions" ON loyalty_transactions;
    DROP POLICY IF EXISTS "Users can create loyalty transactions" ON loyalty_transactions;
    
    -- Create new policies
    CREATE POLICY "Users can view their own loyalty transactions" 
      ON loyalty_transactions FOR SELECT 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Admins can view all loyalty transactions" 
      ON loyalty_transactions FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
      );
      
    CREATE POLICY "Users can create loyalty transactions" 
      ON loyalty_transactions FOR INSERT 
      WITH CHECK (true);
      
    RAISE NOTICE 'Created RLS policies for loyalty_transactions table';
  END IF;
END $$;

-- Output notice to confirm completion
SELECT 'Tables setup completed' as message; 