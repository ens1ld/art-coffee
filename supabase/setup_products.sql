-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT, 
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure the table is accessible
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read products (public read)
CREATE POLICY read_products ON products
  FOR SELECT USING (true);

-- Policy to allow only admins to modify products
CREATE POLICY modify_products ON products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'superadmin'
  );

-- Sample data - only insert if the table is empty
INSERT INTO products (id, name, description, price, image_url, category)
SELECT * FROM (
  VALUES
    (1, 'Espresso', 'Our signature espresso shot, rich and bold.', 3.50, '/images/cards/6.png', 'Coffee'),
    (2, 'Cappuccino', 'Espresso with steamed milk and velvety foam.', 4.50, '/images/cards/7.png', 'Coffee'),
    (3, 'Latte', 'Espresso with steamed milk and a light layer of foam.', 4.75, '/images/cards/8.png', 'Coffee'),
    (4, 'Americano', 'Espresso diluted with hot water for a milder coffee.', 4.00, '/images/cards/9.png', 'Coffee'),
    (5, 'Mocha', 'Espresso with chocolate and steamed milk.', 5.00, '/images/cards/10.png', 'Coffee'),
    (6, 'Cold Brew', 'Coffee brewed with cold water for a smooth taste.', 4.50, '/images/cards/11.png', 'Coffee')
) AS new_products
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Grant permissions
GRANT SELECT ON products TO anon, authenticated;
GRANT ALL ON products TO service_role;

-- Update sequence if we manually set IDs
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products), true); 