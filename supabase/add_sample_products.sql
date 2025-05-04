-- Sample products data with categories matching UI constants (lowercase)
-- Run this script in Supabase SQL Editor to populate your products table

-- Check if we have any existing products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    -- Insert coffee products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Espresso', 'Our signature espresso shot, rich and bold', 2.50, 'coffee', '/images/cards/6.png', false, false),
      ('Cappuccino', 'Espresso with steamed milk and velvety foam', 3.80, 'coffee', '/images/cards/7.png', true, false),
      ('Latte', 'Espresso with steamed milk and a light layer of foam', 4.20, 'coffee', '/images/cards/8.png', false, false),
      ('Americano', 'Espresso diluted with hot water for a milder coffee', 3.50, 'coffee', '/images/cards/9.png', false, false),
      ('Mocha', 'Espresso with chocolate and steamed milk', 4.50, 'coffee', '/images/cards/10.png', false, false);

    -- Insert tea products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Earl Grey', 'Classic black tea with bergamot', 2.80, 'tea', '/images/cards/tea1.png', false, false),
      ('Green Tea', 'Delicate green tea with light floral notes', 2.80, 'tea', '/images/cards/tea2.png', false, false),
      ('Chai Latte', 'Spiced tea with steamed milk', 3.50, 'tea', '/images/cards/tea3.png', true, false);

    -- Insert pastries products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Croissant', 'Buttery, flaky pastry', 2.50, 'pastries', '/images/cards/pastry1.png', false, false),
      ('Pain au Chocolat', 'Chocolate-filled pastry', 3.20, 'pastries', '/images/cards/pastry2.png', false, false),
      ('Almond Croissant', 'Croissant filled with almond cream', 3.50, 'pastries', '/images/cards/pastry3.png', false, false);

    -- Insert breakfast products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Avocado Toast', 'Smashed avocado on toasted sourdough bread', 8.50, 'breakfast', '/images/cards/breakfast1.png', true, false),
      ('Granola Bowl', 'Yogurt with house-made granola and fresh fruits', 7.50, 'breakfast', '/images/cards/breakfast2.png', false, false),
      ('Breakfast Sandwich', 'Egg, cheese, and bacon on a brioche bun', 6.50, 'breakfast', '/images/cards/breakfast3.png', false, false);

    -- Insert lunch products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Caprese Sandwich', 'Fresh mozzarella, tomato, and basil on ciabatta', 9.50, 'lunch', '/images/cards/lunch1.png', false, false),
      ('Caesar Salad', 'Romaine lettuce with parmesan, croutons and Caesar dressing', 8.50, 'lunch', '/images/cards/lunch2.png', false, false),
      ('Quinoa Bowl', 'Quinoa with roasted vegetables and tahini dressing', 10.50, 'lunch', '/images/cards/lunch3.png', true, false);

    -- Insert desserts products
    INSERT INTO products (name, description, price, category, image_url, is_new, is_out_of_stock)
    VALUES
      ('Chocolate Cake', 'Rich chocolate cake with ganache frosting', 5.50, 'desserts', '/images/cards/dessert1.png', false, false),
      ('Cheesecake', 'Creamy cheesecake with berry compote', 6.00, 'desserts', '/images/cards/dessert2.png', false, false),
      ('Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 5.50, 'desserts', '/images/cards/dessert3.png', true, false);
      
    RAISE NOTICE 'Sample products have been added successfully!';
  ELSE
    RAISE NOTICE 'Products table already has data. No sample products were added.';
  END IF;
END $$; 