-- Add additional columns to products table
-- Run this script in Supabase SQL Editor

-- Add is_new column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_new'
  ) THEN
    ALTER TABLE products
    ADD COLUMN is_new BOOLEAN DEFAULT false;
    
    RAISE NOTICE 'Added is_new column to products table';
  ELSE
    RAISE NOTICE 'is_new column already exists in products table';
  END IF;
END $$;

-- Add is_out_of_stock column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_out_of_stock'
  ) THEN
    ALTER TABLE products
    ADD COLUMN is_out_of_stock BOOLEAN DEFAULT false;
    
    RAISE NOTICE 'Added is_out_of_stock column to products table';
  ELSE
    RAISE NOTICE 'is_out_of_stock column already exists in products table';
  END IF;
END $$;

-- Output notice to confirm completion
SELECT 'Products table update completed' as message; 